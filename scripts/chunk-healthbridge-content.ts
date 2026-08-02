import 'dotenv/config'

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { openai } from '@ai-sdk/openai'
import { embedMany } from 'ai'
import { PDFParse } from 'pdf-parse'

import {
  createChunks,
  DEFAULT_MAX_TOKENS,
  DEFAULT_OVERLAP_TOKENS,
  embeddingInput,
  type RagChunksFile,
  sha256,
  TOKENIZER_ENCODING,
} from './lib/rag-chunks'

type CliOptions = {
  input: string
  output: string
  maxTokens: number
  overlapTokens: number
  embeddingModel: string
  skipEmbeddings: boolean
}

const DEFAULT_INPUT = 'src/healthbridge content.pdf'
const DEFAULT_OUTPUT = 'src/data/rag/healthbridge-content.chunks.json'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`)
  return value
}

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    maxTokens: DEFAULT_MAX_TOKENS,
    overlapTokens: DEFAULT_OVERLAP_TOKENS,
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
    skipEmbeddings: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    if (flag === '--') continue
    if (flag === '--skip-embeddings') {
      options.skipEmbeddings = true
      continue
    }

    const value = readValue(args, index, flag)
    index += 1
    switch (flag) {
      case '--input':
        options.input = value
        break
      case '--output':
        options.output = value
        break
      case '--max-tokens':
        options.maxTokens = Number(value)
        break
      case '--overlap-tokens':
        options.overlapTokens = Number(value)
        break
      case '--embedding-model':
        options.embeddingModel = value
        break
      default:
        throw new Error(`Unknown option: ${flag}`)
    }
  }

  return options
}

async function extractPages(pdf: Uint8Array) {
  const parser = new PDFParse({ data: pdf })
  try {
    const result = await parser.getText({ pageJoiner: '', parseHyperlinks: true })
    return result.pages.map((page) => ({ page: page.num, text: page.text }))
  } finally {
    await parser.destroy()
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!options.skipEmbeddings && !process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is required. Use --skip-embeddings to generate text chunks only.',
    )
  }

  const inputPath = path.resolve(options.input)
  const outputPath = path.resolve(options.output)
  const pdf = await readFile(inputPath)
  if (pdf.subarray(0, 5).toString() !== '%PDF-')
    throw new Error(`${options.input} is not a PDF file.`)
  const sourceHash = sha256(pdf)

  const pages = await extractPages(pdf)
  const chunks = createChunks(pages, {
    maxTokens: options.maxTokens,
    overlapTokens: options.overlapTokens,
  })

  let embedding: RagChunksFile['embedding'] = null
  if (!options.skipEmbeddings) {
    const result = await embedMany({
      model: openai.embedding(options.embeddingModel),
      values: chunks.map(embeddingInput),
      maxParallelCalls: 2,
      maxRetries: 3,
    })
    if (result.embeddings.length !== chunks.length) {
      throw new Error('The embeddings response did not match the number of chunks.')
    }
    result.embeddings.forEach((vector, index) => {
      chunks[index].embedding = vector
    })
    embedding = {
      model: options.embeddingModel,
      dimensions: result.embeddings[0]?.length ?? 0,
    }
  }

  const document: RagChunksFile = {
    schemaVersion: 1,
    source: {
      filename: path.basename(inputPath),
      path: path.relative(process.cwd(), inputPath).replaceAll(path.sep, '/'),
      sha256: sourceHash,
      pageCount: pages.length,
    },
    chunking: {
      tokenizer: TOKENIZER_ENCODING,
      maxTokens: options.maxTokens,
      overlapTokens: options.overlapTokens,
    },
    embedding,
    chunks,
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8')
  console.log(
    `Created ${chunks.length} chunks from ${pages.length} pages at ${path.relative(process.cwd(), outputPath)}${
      embedding ? ` with ${embedding.model} embeddings (${embedding.dimensions} dimensions)` : ''
    }.`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
