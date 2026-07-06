# Convio — AI Integration

## Architecture

```
User
   │
   ▼
Agent
   │
   ├── Provider Router
   ├── Model Router
   ├── Tool Manager
   ├── RAG Engine
   ├── Moderation
   └── Streaming
           │
           ▼
      AI Provider
```

---

## Providers

| Provider | Use Case |
|----------|----------|
| **OpenAI** | GPT-4o, GPT-4o-mini |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku |
| **Google** | Gemini 1.5 Pro, Gemini 1.5 Flash |
| **Groq** | Fast inference (Llama, Mixtral) |
| **OpenRouter** | Access to multiple models |

---

## Provider Interface (base.ts)

```typescript
interface AIProvider {
  generate(params: GenerateParams): Promise<GenerateResult>
  stream(params: GenerateParams): AsyncIterable<StreamChunk>
  embed(text: string): Promise<number[]>
  moderate(text: string): Promise<ModerationResult>
  listModels(): Promise<Model[]>
}
```

---

## Models (Dynamic)

| Plan | Available Models |
|------|------------------|
| **Free** | GPT-4o-mini, Gemini Flash, Groq (Llama) |
| **Pro (Own API Key)** | Any supported model |

---

## Streaming

- SSE for AI responses
- WebSocket for notifications/presence only

---

## Tools

### Launch

- Web Search
- Calculator
- URL Fetcher

### Later

- Code Interpreter
- Image Generation
- Custom Tools / MCP
- Database Tools

---

## RAG

| Setting | Default | Configurable |
|---------|---------|--------------|
| Chunking | Recursive | Yes |
| Embedding | OpenAI text-embedding-3-small | Yes (abstract) |
| Top K | 5 | Yes |
| Similarity | 0.7 | Yes |

---

## Templates (8)

1. Customer Support
2. FAQ Bot
3. Sales Assistant
4. Lead Qualifier
5. Meeting Scheduler
6. Documentation Assistant
7. Technical Support
8. Custom Blank

---

## Moderation

| Priority | Method |
|----------|--------|
| 1st | Provider-based (OpenAI moderation for OpenAI models) |
| Fallback | Custom rules |

---

## File Structure

```
ai/
├── providers/
│   ├── base.ts
│   ├── openai.ts
│   ├── anthropic.ts
│   ├── google.ts
│   ├── openrouter.ts
│   ├── groq.ts
│   └── registry.ts
│
├── models/
│   └── index.ts
│
├── tools/
│   ├── web-search.ts
│   ├── calculator.ts
│   ├── url-fetcher.ts
│   └── registry.ts
│
├── rag/
│   ├── chunker.ts
│   ├── embeddings.ts
│   └── vector-search.ts
│
├── templates/
│   ├── customer-support.ts
│   ├── faq-bot.ts
│   ├── sales-assistant.ts
│   ├── lead-qualifier.ts
│   ├── meeting-scheduler.ts
│   ├── documentation-assistant.ts
│   ├── technical-support.ts
│   └── custom-blank.ts
│
├── moderation/
│   ├── provider-based.ts
│   └── custom-rules.ts
│
├── streaming.ts
└── index.ts
```
