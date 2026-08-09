import 'dotenv/config'

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import { MongoClient } from 'mongodb'

type MediaDocument = {
  id: number | string
  filename?: null | string
  url?: null | string
  alt?: null | string | Record<string, null | string>
  sizes?: null | Record<string, { filename?: null | string; url?: null | string } | null>
}

type MigrationAction = {
  action: 'create' | 'skip' | 'update'
  filename: string
  id?: number | string
  reason?: string
  url?: string
}

const APPLY = process.argv.includes('--apply')
const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const MIGRATION_DIRECTORY = path.resolve('.media-migration')
const PUBLIC_DIRECTORY = path.resolve('public')
const MEDIA_PREFIX = 'media'

const spaces = {
  bucket: process.env.DO_SPACES_BUCKET || '',
  region: process.env.DO_SPACES_REGION || '',
  endpoint: process.env.DO_SPACES_ENDPOINT || '',
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY || '',
  cdnURL: (
    process.env.DO_SPACES_CDN_URL ||
    process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL ||
    ''
  ).replace(/\/+$/, ''),
}

const requireSpacesConfig = (): void => {
  const missing = Object.entries(spaces)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(`Missing DigitalOcean Spaces configuration: ${missing.join(', ')}`)
  }

  const endpointHost = new URL(spaces.endpoint).hostname
  if (endpointHost.startsWith(`${spaces.bucket}.`)) {
    throw new Error(
      'DO_SPACES_ENDPOINT must be the regional API endpoint, for example https://tor1.digitaloceanspaces.com.',
    )
  }
}

const walkFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? walkFiles(entryPath) : Promise.resolve([entryPath])
    }),
  )
  return files.flat()
}

const findAllMedia = async (payload: Payload): Promise<MediaDocument[]> => {
  const documents: MediaDocument[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })
    documents.push(...(result.docs as MediaDocument[]))
    if (!result.hasNextPage) break
    page += 1
  }

  return documents
}

const getContentType = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase()
  const types: Record<string, string> = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }
  return types[extension] || 'application/octet-stream'
}

const humanizeFilename = (filename: string): string =>
  path.basename(filename, path.extname(filename)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()

const encodeObjectPath = (value: string): string =>
  value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

const getCDNURL = (key: string): string => `${spaces.cdnURL}/${encodeObjectPath(key)}`

const createS3Client = (): S3Client =>
  new S3Client({
    endpoint: spaces.endpoint,
    region: spaces.region,
    credentials: {
      accessKeyId: spaces.accessKeyId,
      secretAccessKey: spaces.secretAccessKey,
    },
  })

const verifyPublicObject = async (url: string): Promise<void> => {
  let lastStatus = 0
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { cache: 'no-store' })
    lastStatus = response.status
    if (response.ok) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Public CDN verification failed with HTTP ${lastStatus}.`)
}

const runStorageProbe = async (client: S3Client): Promise<void> => {
  const key = `${MEDIA_PREFIX}/__migration-probe-${randomUUID()}.txt`
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: spaces.bucket,
        Key: key,
        Body: 'healthbridge-spaces-probe',
        ContentType: 'text/plain',
        ACL: 'public-read',
      }),
    )
    await client.send(new HeadObjectCommand({ Bucket: spaces.bucket, Key: key }))
    await verifyPublicObject(getCDNURL(key))
  } finally {
    await client.send(new DeleteObjectCommand({ Bucket: spaces.bucket, Key: key })).catch(() => {})
  }
}

const snapshotMedia = async (): Promise<string> => {
  const databaseURL =
    process.env.DATABASE_URL ||
    process.env.REMOTE_DATABASE_URL ||
    process.env.LOCAL_DATABASE_URL ||
    'mongodb://127.0.0.1:27017/health-bridge'
  const client = new MongoClient(databaseURL)
  await client.connect()
  try {
    const documents = await client
      .db()
      .collection('media')
      .find(
        {},
        {
          projection: {
            _id: 1,
            alt: 1,
            caption: 1,
            filename: 1,
            prefix: 1,
            sizes: 1,
            thumbnailURL: 1,
            url: 1,
            updatedAt: 1,
          },
        },
      )
      .toArray()

    await mkdir(MIGRATION_DIRECTORY, { recursive: true })
    const snapshotPath = path.join(
      MIGRATION_DIRECTORY,
      `media-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    )
    await writeFile(snapshotPath, JSON.stringify(documents, null, 2), 'utf8')
    return snapshotPath
  } finally {
    await client.close()
  }
}

const uploadIfMissing = async (client: S3Client, filename: string, filePath: string) => {
  const key = `${MEDIA_PREFIX}/${filename}`
  try {
    await client.send(new HeadObjectCommand({ Bucket: spaces.bucket, Key: key }))
    return false
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
    if (status && status !== 404) throw error
  }

  await client.send(
    new PutObjectCommand({
      Bucket: spaces.bucket,
      Key: key,
      Body: await readFile(filePath),
      ContentType: getContentType(filename),
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
  return true
}

const main = async (): Promise<void> => {
  requireSpacesConfig()

  const [{ default: config }] = await Promise.all([import('../src/payload.config')])
  const payload = await getPayload({ config })
  const localFileBackup = new Map<string, Buffer>()

  try {
    const mediaDocuments = await findAllMedia(payload)
    const byFilename = new Map(
      mediaDocuments
        .filter((document) => document.filename)
        .map((document) => [document.filename!, document]),
    )
    const generatedFilenames = new Set(
      mediaDocuments.flatMap((document) =>
        Object.values(document.sizes || {})
          .map((size) => size?.filename)
          .filter((filename): filename is string => Boolean(filename)),
      ),
    )

    const allImagePaths = (await walkFiles(PUBLIC_DIRECTORY)).filter((filePath) =>
      IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
    )
    const filesByName = new Map<string, string>()
    for (const filePath of allImagePaths) {
      const filename = path.basename(filePath)
      if (filesByName.has(filename)) {
        throw new Error(`Duplicate filesystem image filename: ${filename}`)
      }
      filesByName.set(filename, filePath)
    }

    const originalFiles = [...filesByName.entries()].filter(
      ([filename]) => !generatedFilenames.has(filename),
    )
    const matchingRecords = originalFiles.filter(([filename]) => byFilename.has(filename))
    const newRecords = originalFiles.filter(([filename]) => !byFilename.has(filename))
    const missingRecords = mediaDocuments.filter(
      (document) => document.filename && !filesByName.has(document.filename),
    )

    const summary = {
      mode: APPLY ? 'apply' : 'dry-run',
      filesystemImages: allImagePaths.length,
      originals: originalFiles.length,
      generatedVariants: allImagePaths.length - originalFiles.length,
      existingRecordsToUpdate: matchingRecords.length,
      newRecordsToCreate: newRecords.length,
      missingSourceRecords: missingRecords.length,
    }
    console.log(JSON.stringify(summary, null, 2))

    if (!APPLY) return

    for (const filePath of allImagePaths) {
      localFileBackup.set(filePath, await readFile(filePath))
    }

    const snapshotPath = await snapshotMedia()
    const s3 = createS3Client()
    await runStorageProbe(s3)

    const actions: MigrationAction[] = []
    for (const [filename, filePath] of originalFiles) {
      const existing = byFilename.get(filename)
      try {
        const document = existing
          ? await payload.update({
              collection: 'media',
              id: existing.id,
              data: {},
              filePath,
              overwriteExistingFiles: true,
              overrideAccess: true,
            })
          : await payload.create({
              collection: 'media',
              data: { alt: humanizeFilename(filename) },
              filePath,
              overwriteExistingFiles: true,
              overrideAccess: true,
            })

        if (!document.url?.startsWith(`${spaces.cdnURL}/${MEDIA_PREFIX}/`)) {
          throw new Error(`Payload returned an unexpected URL: ${document.url || '(empty)'}`)
        }
        actions.push({
          action: existing ? 'update' : 'create',
          filename,
          id: document.id,
          url: document.url,
        })
      } catch (error) {
        actions.push({
          action: 'skip',
          filename,
          id: existing?.id,
          reason: error instanceof Error ? error.message : String(error),
        })
      }
    }

    let reconciledUploads = 0
    for (const [filename, filePath] of filesByName) {
      if (await uploadIfMissing(s3, filename, filePath)) reconciledUploads += 1
      await verifyPublicObject(getCDNURL(`${MEDIA_PREFIX}/${filename}`))
    }

    const report = {
      ...summary,
      snapshotPath,
      reconciledUploads,
      actions,
      missingRecords: missingRecords.map((document) => ({
        id: document.id,
        filename: document.filename,
        expectedURL: document.filename ? getCDNURL(`${MEDIA_PREFIX}/${document.filename}`) : null,
      })),
    }
    const reportPath = path.join(
      MIGRATION_DIRECTORY,
      `media-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    )
    await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
    console.log(JSON.stringify({ reportPath, actions: actions.length, reconciledUploads }, null, 2))

    const failures = actions.filter((action) => action.action === 'skip')
    if (failures.length) {
      throw new Error(`${failures.length} media records failed. See ${reportPath}.`)
    }
  } finally {
    for (const [filePath, contents] of localFileBackup) {
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, contents)
    }
    await Promise.race([
      payload.destroy(),
      new Promise<void>((resolve) => setTimeout(resolve, 5000)),
    ])
  }
}

try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
