# HealthBridge Chatbot: Engineering Onboarding Guide

## Purpose and scope

The HealthBridge chatbot helps users navigate the Canadian healthcare system and provides general educational information. It uses a local, pre-embedded HealthBridge PDF as a retrieval-augmented generation (RAG) source. It is not a diagnostic tool and does not have access to private health records, live service directories, web search, user-uploaded files, images, voice, or external tools.

The feature supports two modes:

- Guests can chat and receive streamed responses, but their conversation exists only in browser memory.
- Authenticated Supabase users have their conversations and completed messages stored in MongoDB through Payload CMS. They can resume, rename, and delete those conversations.

The main user-facing routes are:

| Route | Purpose |
| --- | --- |
| `/chat` | Starts a new guest or authenticated chat. |
| `/chat/[id]` | Reopens an authenticated user's saved conversation. |
| `/dashboard/chats` | Lists the authenticated user's saved conversations. |
| `POST /api/chat` | Validates messages, loads trusted history, and streams an OpenAI response. |
| `PATCH /api/chat/conversations/[id]` | Renames an owned conversation. |
| `DELETE /api/chat/conversations/[id]` | Permanently deletes an owned conversation and its messages. |

## Libraries and what they do

The chatbot uses the following libraries from `package.json`:

| Library | Usage in this feature |
| --- | --- |
| `ai` | Vercel AI SDK core. Provides `DefaultChatTransport`, `streamText`, `convertToModelMessages`, and the AI SDK UI message stream protocol. |
| `@ai-sdk/react` | Provides the `useChat` React hook for message state, streaming status, send, stop, and retry behavior. |
| `@ai-sdk/openai` | Connects Vercel AI SDK to OpenAI. The route uses `openai.responses(...)` to select the Responses API explicitly. |
| `next` | Supplies App Router pages, server components, route handlers, redirects, metadata, and server/client boundaries. |
| `react` | Manages chat input, conversation state, effects, refs, and incremental rendering. |
| `payload` | Provides the trusted Local API used to create, query, update, and delete chat records. |
| `@payloadcms/db-mongodb` | Connects Payload collections to MongoDB. Chat records use the application's existing Payload database connection. |
| `@supabase/ssr` | Supports server-side Supabase authentication in the Next.js application. |
| `@supabase/supabase-js` | Supplies Supabase user and authentication types and APIs. The verified Supabase UUID is the chat owner ID. |
| `lucide-react` | Supplies icons used by the chat and history interfaces. |
| Tailwind CSS | Provides the utility classes used for responsive layout, colors, focus states, and chat message styling. |
| `vitest` | Runs integration and mocked streaming route tests. |
| `@playwright/test` | Supports browser-level end-to-end tests. |

The AI SDK packages are pinned to exact versions. Upgrade `ai`, `@ai-sdk/react`, and `@ai-sdk/openai` together and re-test the wire format because UI message parts and streaming lifecycle behavior can change between releases.

## Code map

| File | Responsibility |
| --- | --- |
| [`src/app/(frontend)/chat/ChatClient.tsx`](../src/app/(frontend)/chat/ChatClient.tsx) | Client chat UI and `useChat` integration. |
| [`src/app/(frontend)/chat/page.tsx`](../src/app/(frontend)/chat/page.tsx) | New-chat page and optional user greeting. |
| [`src/app/(frontend)/chat/[id]/page.tsx`](../src/app/(frontend)/chat/%5Bid%5D/page.tsx) | Owner-checked saved-chat loader. |
| [`src/app/api/chat/route.ts`](../src/app/api/chat/route.ts) | Main validation, authentication, persistence, OpenAI, and streaming route. |
| [`src/app/api/chat/conversations/[id]/route.ts`](../src/app/api/chat/conversations/%5Bid%5D/route.ts) | Rename and hard-delete handlers. |
| [`src/lib/chat/messages.ts`](../src/lib/chat/messages.ts) | Message limits, client-message validation, text extraction, and UI-message conversion. |
| [`src/lib/chat/rag.ts`](../src/lib/chat/rag.ts) | Loads the local RAG index, embeds queries, ranks chunks, and formats page-labelled excerpts. |
| [`src/lib/chat/store.ts`](../src/lib/chat/store.ts) | All trusted Payload Local API operations for chat data. |
| [`src/lib/chat/types.ts`](../src/lib/chat/types.ts) | Shared UI-message metadata, request, and history types. |
| [`src/collections/ChatConversations.ts`](../src/collections/ChatConversations.ts) | Conversation collection schema and cascading-delete hook. |
| [`src/collections/ChatMessages.ts`](../src/collections/ChatMessages.ts) | Message collection schema and completion states. |
| [`src/app/(frontend)/dashboard/chats/page.tsx`](../src/app/(frontend)/dashboard/chats/page.tsx) | Authenticated history page. |
| [`src/app/(frontend)/dashboard/chats/ChatHistoryClient.tsx`](../src/app/(frontend)/dashboard/chats/ChatHistoryClient.tsx) | Resume, rename, and delete UI. |
| [`tests/int/chat.int.spec.ts`](../tests/int/chat.int.spec.ts) | Persistence, access, cascade deletion, and message validation tests. |
| [`tests/int/chat-route.int.spec.ts`](../tests/int/chat-route.int.spec.ts) | Mocked route and streaming lifecycle tests. |

## End-to-end message flow

### 1. Client submission

`ChatClient` creates a `DefaultChatTransport` pointed at `POST /api/chat` and passes it to `useChat`.

When the user submits text:

1. The client trims the input and rejects empty or oversized text.
2. `useChat.sendMessage({ text })` adds a user UI message immediately.
3. The transport sends the latest 20 UI messages, the chat session ID, the optional MongoDB conversation ID, and the trigger type.
4. `useChat` changes status from `submitted` to `streaming` as stream events arrive.
5. Text deltas incrementally update the assistant message.

The maximum user-message length is 4,000 characters. The message pane scrolls itself during updates; it does not scroll the entire document.

### 2. Server validation

`POST /api/chat` checks configuration before doing any provider work. It then parses the JSON body with `parseClientMessages`.

The validator:

- accepts only `user` and `assistant` roles;
- accepts visible text parts only;
- discards the AI SDK's assistant-only `step-start` structural marker;
- rejects files, tool calls, sources, and arbitrary data parts;
- requires non-empty text;
- limits user messages to 4,000 characters;
- limits assistant messages to 16,000 characters; and
- limits incoming context to 20 messages.

Never weaken this validator merely to make a new client payload pass. First inspect whether a new AI SDK part is harmless structural metadata or model-visible/untrusted content.

### 3. Authentication and ownership

The route calls `supabase.auth.getUser()` on the server. It never accepts an owner ID from the browser.

The verified Supabase user UUID is the only ownership identity. Every authenticated lookup includes both the MongoDB conversation ID and the verified `ownerId`. Invalid IDs and cross-user access both return the same non-disclosing `404 Conversation not found` response.

### 4. Guest flow

For a guest:

1. The server uses the validated browser-held messages as context.
2. On retry, the last assistant response is removed before regeneration when present.
3. `convertToModelMessages` converts the sanitized UI messages for `streamText`.
4. No conversation or message record is created.
5. Reloading the page clears the guest conversation.

Guest messages must remain non-persistent unless the product requirements and privacy design are intentionally changed.

### 5. Authenticated flow

For a signed-in user submitting a new message:

1. The server owner-checks the supplied conversation ID, if any.
2. If this is the first message, it creates a conversation whose initial title is derived from that message.
3. It stores the user message as `completed` before contacting OpenAI.
4. It creates an assistant message with `pending` state.
5. It loads only the latest 20 completed MongoDB messages as trusted model context.
6. It starts generation and sends the conversation ID and persisted assistant-message ID in stream metadata.
7. When generation finishes, the pending message is updated with the final text, provider response ID, usage metadata, and `completed` state.
8. The conversation's count, preview, and latest-message timestamp are refreshed.

The browser-supplied assistant history is never trusted as the authenticated model context. MongoDB is the source of truth for saved chats.

### 6. OpenAI generation

The route calls:

```ts
streamText({
  model: openai.responses(process.env.OPENAI_MODEL || 'gpt-5.6-luna'),
  // system prompt, messages, abort handling, and provider options
})
```

Important provider settings:

- The Responses API is selected explicitly with `openai.responses(...)`.
- `store: false` prevents OpenAI response storage for this request.
- `safetyIdentifier` is a SHA-256 hash derived from `PAYLOAD_SECRET` and the authenticated user or guest session. Raw user IDs are not sent as the safety identifier.
- Output is limited to 1,200 tokens.
- No tools, web search, or resumable streams are enabled.

Before generation, the route builds a retrieval query from the latest two sanitized user turns. It
embeds that query using the same model recorded in the generated RAG file, compares the query
vector with the local chunk vectors, and injects up to four chunks scoring at least `0.25`. Retrieved
content is delimited as untrusted reference data and includes exact page labels for citations.

If retrieval fails, generation continues under an explicit instruction that the HealthBridge source
is unavailable. The server logs only the error type, not the user's query. For authenticated chats,
the selected chunk IDs, page ranges, scores, source hash, model, and retrieval status are stored in
the assistant message's hidden provider metadata.

The system prompt tells the model to respond in the user's language, focus on Canadian health-system navigation, avoid diagnosis or prescriptions, disclose relevant limitations, direct emergencies to 911, and avoid implying access to HealthBridge or live service data.

### 7. Streaming lifecycle

The server returns `toUIMessageStreamResponse`, not a custom SSE protocol. `useChat` understands this stream and incrementally renders text.

Lifecycle outcomes are persisted as follows:

| Outcome | Stored assistant state | Stored content |
| --- | --- | --- |
| Normal response | `completed` | Final generated text. |
| User presses Stop or request aborts | `interrupted` | Partial text, or a fallback interruption message. |
| Provider or stream error | `error` | Partial text, or a fallback failure message. |

A `finalized` guard prevents completion callbacks from updating the same stored assistant message more than once. Only `completed` messages are loaded into future model context or displayed when reopening a saved conversation.

The stream includes typed metadata for the conversation ID, persisted assistant-message ID, and pending/completed state. On the first authenticated response, `ChatClient` replaces the URL with `/chat/[conversationId]` without forcing a page reload.

## Data model

### `chat-conversations`

| Field | Meaning |
| --- | --- |
| `ownerId` | Verified Supabase UUID. Indexed. |
| `title` | User-editable title, maximum 80 characters. |
| `status` | `active` or `archived`; v1 currently uses active conversations. |
| `messageCount` | Count of completed messages. |
| `lastMessageAt` | Timestamp used for recent-first sorting. Indexed. |
| `lastMessagePreview` | Whitespace-normalized preview, maximum 240 characters. |
| Payload timestamps | `createdAt` and `updatedAt`. |

### `chat-messages`

| Field | Meaning |
| --- | --- |
| `conversation` | Indexed relationship to `chat-conversations`. |
| `ownerId` | Verified Supabase UUID. Indexed. |
| `role` | `user` or `assistant`. |
| `content` | Plain text transcript content. |
| `state` | `pending`, `completed`, `interrupted`, or `error`. |
| `providerResponseId` | Optional OpenAI response identifier. Hidden in admin configuration. |
| `providerMetadata` | Optional serializable finish reason, usage, and provider metadata. Hidden in admin configuration. |
| Payload timestamps | `createdAt` and `updatedAt`. |

Deleting a conversation runs a Payload `beforeDelete` hook that hard-deletes all related messages.

## Payload and transcript security

Both chat collections:

- are hidden from the Payload admin navigation;
- deny normal create, read, update, and delete access; and
- are accessed only by trusted server-side helpers in `src/lib/chat/store.ts`.

Those helpers use Payload's Local API with `overrideAccess: true`, so every helper that handles user data must apply its own explicit `ownerId` filter. Do not call these helpers with a client-provided owner ID. Do not expose either collection through a generic Payload REST or GraphQL endpoint.

Plain text is rendered with preserved line breaks. Arbitrary assistant-generated HTML is not rendered.

## Conversation history operations

`/dashboard/chats` is a server-protected page. It lists up to 100 owned conversations ordered by recent activity.

- Resume links to `/chat/[id]`, which verifies authentication and ownership before loading completed messages.
- Rename sends `PATCH` with a normalized title of 1–80 characters.
- Delete sends `DELETE` and permanently removes the conversation plus its related messages.
- Cross-user rename, resume, and delete attempts receive the same `404` as a missing record.

## Environment configuration

Required variables:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
PAYLOAD_SECRET=
```

The existing Payload MongoDB and Supabase variables must also be configured for authenticated persistence. `OPENAI_MODEL` is optional at runtime because the route defaults to `gpt-5.6-luna`.

### Preparing the HealthBridge RAG source

Generate retrieval-ready chunks and embeddings from the HealthBridge PDF with:

```bash
pnpm rag:chunk
```

The command reads `src/healthbridge content.pdf` and writes
`src/data/rag/healthbridge-content.chunks.json`. It defaults to 800-token chunks with 120-token
overlap and `text-embedding-3-small`. Set `OPENAI_EMBEDDING_MODEL` to use another embedding
model, or run `pnpm rag:chunk -- --skip-embeddings` when only local text chunks are needed.

The generated file is loaded and cached by the server-side chat route. Rerun the command whenever
the PDF changes so both chunks and embeddings remain synchronized with the source. Restart the
local application after regeneration so a running server does not continue using its cached index;
production deployments load the new index when the application starts.

Keep API keys server-side. Never prefix `OPENAI_API_KEY` with `NEXT_PUBLIC_` or send it to the browser.

ChatGPT subscriptions and OpenAI API billing are separate. The API project associated with `OPENAI_API_KEY` must have available credits and access to the configured model.

## Common troubleshooting

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| `A chat message is malformed.` | The browser sent an unsupported role/shape, an empty part list, or a message with no usable text. | Inspect the `/api/chat` request payload and `parseClientMessages`. AI SDK `step-start` markers are intentionally ignored. |
| Stream starts and then immediately emits an error | OpenAI rejected the generation after local validation and persistence succeeded. | Check API credits, project limits, model access, and server logs. A 429 with “no credits remaining” requires funding the API project or using a funded project key. |
| `Chat is not configured yet` | `OPENAI_API_KEY` or `PAYLOAD_SECRET` is missing. | Update `.env` and restart the development server. |
| Saved conversation returns 404 | The ID is invalid, missing, or belongs to another user. | Confirm the signed-in Supabase account and owner-scoped MongoDB record. Do not make the response more revealing. |
| Guest history disappears after reload | Expected v1 behavior. | Sign in before starting a conversation that must be saved. |
| Assistant message does not appear after reopening | It is incomplete. | Only `completed` messages are loaded. Inspect whether the stored state is `pending`, `interrupted`, or `error`. |
| Sending a message moves the whole page | A document-level scrolling API was introduced. | Keep auto-scroll scoped to the message pane's `scrollTop`/`scrollTo`; do not use `scrollIntoView` for the transcript endpoint. |

## Testing and change checklist

Run the relevant checks after modifying chat behavior:

```bash
pnpm test:int
pnpm lint
pnpm generate:types
```

Run Playwright tests when changing the user interaction or routing behavior:

```bash
pnpm test:e2e
```

Before merging a chatbot change, verify:

- guest requests do not create MongoDB records;
- authenticated writes use the verified Supabase UUID;
- every conversation operation is owner-scoped;
- only completed stored messages enter future model context;
- malformed, oversized, non-text, and excessive histories fail before OpenAI is called;
- stop and provider failures do not mark partial responses completed;
- retry does not duplicate the user message;
- streamed metadata still assigns the conversation URL after the first authenticated response;
- transcript output remains plain text;
- conversation deletion still cascades to messages; and
- both desktop and mobile dashboard navigation still expose **My Chats**.

## Current v1 boundaries

Do not assume these capabilities exist:

- web search or citations for anything outside the retrieved HealthBridge content;
- agent tools or external actions;
- file, image, or voice input;
- guest persistence or guest-to-account migration;
- stream reconnection/resumption;
- application-level rate limiting; or
- clinical diagnosis, prescriptions, or professional medical advice.

Any change to these boundaries should include a privacy and security review, an updated system prompt, new validation rules, persistence decisions, and tests before release.
