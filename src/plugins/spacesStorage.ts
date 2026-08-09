import { s3Storage } from '@payloadcms/storage-s3'

import { buildSpacesMediaURL } from '@/utilities/spacesMedia'

const requiredSpacesEnv = {
  bucket: process.env.DO_SPACES_BUCKET,
  region: process.env.DO_SPACES_REGION,
  endpoint: process.env.DO_SPACES_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
  cdnURL: process.env.DO_SPACES_CDN_URL,
}

const configuredValues = Object.values(requiredSpacesEnv)
const isPartiallyConfigured = configuredValues.some(Boolean)
const isSpacesConfigured = configuredValues.every(Boolean)

if (isPartiallyConfigured && !isSpacesConfigured) {
  const missing = Object.entries(requiredSpacesEnv)
    .filter(([, value]) => !value)
    .map(([name]) => name)
    .join(', ')

  throw new Error(`DigitalOcean Spaces configuration is incomplete. Missing: ${missing}`)
}

if (process.env.NODE_ENV === 'production' && !isSpacesConfigured) {
  throw new Error('DigitalOcean Spaces configuration is required in production.')
}

export const spacesStoragePlugin = s3Storage({
  enabled: isSpacesConfigured,
  alwaysInsertFields: true,
  bucket: requiredSpacesEnv.bucket || 'spaces-not-configured',
  acl: 'public-read',
  disableLocalStorage: true,
  useCompositePrefixes: true,
  collections: {
    media: {
      prefix: 'media',
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => buildSpacesMediaURL(filename, prefix || 'media'),
    },
  },
  config: {
    endpoint: requiredSpacesEnv.endpoint,
    region: requiredSpacesEnv.region,
    credentials: isSpacesConfigured
      ? {
          accessKeyId: requiredSpacesEnv.accessKeyId!,
          secretAccessKey: requiredSpacesEnv.secretAccessKey!,
        }
      : undefined,
  },
})
