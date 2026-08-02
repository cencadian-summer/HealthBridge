# HealthBridge RAG: Chunking and Embeddings

This guide explains how `src/healthbridge content.pdf` becomes the local RAG index used by the chatbot, and how to regenerate that index whenever the PDF changes.

## Files involved

| File | Purpose |
| --- | --- |
| `src/healthbridge content.pdf` | Source document maintained by the project |
| `scripts/chunk-healthbridge-content.ts` | Command-line entry point for extraction, chunking, and embedding |
| `scripts/lib/rag-chunks.ts` | Text normalization and chunk-building logic |
| `src/data/rag/healthbridge-content.chunks.json` | Generated, chatbot-ready RAG index |

The generated JSON should be treated as a build artifact derived from the PDF. Commit both the PDF and JSON when the source content changes so deployments use the matching index.

## How the index is generated

The generator performs the following steps:

1. Validates that the input begins with a PDF header.
2. Extracts selectable text page by page and preserves useful hyperlink text.
3. Normalizes Unicode and whitespace, removes PDF-only artifacts, reconstructs wrapped lines, and recognizes headings and list items.
4. Tokenizes text with `cl100k_base` and creates chunks with these defaults:
   - maximum size: 800 tokens;
   - overlap: 120 tokens.
5. Records each chunk's page range, inferred section headings, token count, and a stable ID based on its content and pages.
6. Sends the chunks to OpenAI in batches using the configured embedding model. The current index uses `text-embedding-3-small` and 1,536-dimensional vectors.
7. Writes the source hash, chunking settings, embedding metadata, chunks, and vectors to the JSON index.

Section headings may be prepended to the text sent for embedding when they are not already present in the chunk. This improves retrieval while leaving the stored excerpt text clean.

## Prerequisites

Add a valid server-side key to the local environment file:

```dotenv
OPENAI_API_KEY=your-key
```

The embedding model can optionally be overridden:

```dotenv
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Do not expose the API key through a `NEXT_PUBLIC_` variable.

## Regenerate after changing the PDF

Every time the PDF's content changes:

1. Save or replace `src/healthbridge content.pdf`.
2. Run the generator:

   ```bash
   npm run rag:chunk
   ```

   With pnpm, use:

   ```bash
   pnpm rag:chunk
   ```

3. Confirm the command reports the page count, chunk count, embedding model, vector dimensions, and output path.
4. Restart the development server. The chatbot caches the parsed index in each server process.
5. Commit both the changed PDF and `src/data/rag/healthbridge-content.chunks.json`.

For production, regenerate the JSON before building and redeploy the application. The PDF is not parsed during chat requests.

## Command options

| Option | Default | Description |
| --- | --- | --- |
| `--input` | `src/healthbridge content.pdf` | PDF to process |
| `--output` | `src/data/rag/healthbridge-content.chunks.json` | Generated JSON path |
| `--max-tokens` | `800` | Maximum tokens per chunk |
| `--overlap-tokens` | `120` | Context repeated between neighboring chunks |
| `--embedding-model` | environment value or `text-embedding-3-small` | OpenAI embedding model |
| `--skip-embeddings` | off | Generate chunks without calling the embedding API |

Example with custom chunk settings:

```bash
npm run rag:chunk -- --max-tokens 600 --overlap-tokens 100
```

Example with custom paths:

```bash
npm run rag:chunk -- --input "src/healthbridge content.pdf" --output "src/data/rag/healthbridge-content.chunks.json"
```

`--skip-embeddings` is useful only for inspecting or testing chunk boundaries. Its output is **not chatbot-ready** because runtime retrieval requires a vector on every chunk and consistent embedding dimensions.

## Generated JSON structure

The index contains metadata similar to this abbreviated example:

```json
{
  "schemaVersion": 1,
  "source": {
    "filename": "healthbridge content.pdf",
    "path": "src/healthbridge content.pdf",
    "sha256": "...",
    "pageCount": 66
  },
  "chunking": {
    "tokenizer": "cl100k_base",
    "maxTokens": 800,
    "overlapTokens": 120
  },
  "embedding": {
    "model": "text-embedding-3-small",
    "dimensions": 1536
  },
  "chunks": [
    {
      "id": "chunk-0001-...",
      "text": "...",
      "pageStart": 1,
      "pageEnd": 2,
      "sections": ["..."],
      "tokenCount": 742,
      "embedding": [0.0123]
    }
  ]
}
```

The source SHA-256 hash makes it possible to identify which PDF produced an index. There is no generated timestamp, so rebuilding unchanged content does not create timestamp-only diffs.

## Validation and troubleshooting

Run the RAG-focused tests after changing the generator:

```bash
npx vitest run tests/int/rag-chunking.int.spec.ts tests/int/rag-retrieval.int.spec.ts --config ./vitest.config.mts
```

Common failures:

- **Missing `OPENAI_API_KEY`:** add the server-side key to the environment, then rerun the command.
- **No extractable text:** the PDF may contain scanned images. The current generator does not perform OCR; create a text-searchable PDF first.
- **Malformed or non-PDF input:** verify the input path and that the file is a valid PDF.
- **Embedding request failure:** check API access, account limits, and the configured model, then rerun. Retries are performed automatically for transient errors.
- **Chatbot reports the source is unavailable after regeneration:** ensure embeddings were not skipped and restart the server so its cached index is cleared.

Embedding charges occur when the index is regenerated. At chat time, a separate small embedding request is made for each retrieval query; the document chunks are not re-embedded on every chat request.
