# Convio — Multi-channel Deployment

## Launch Phases

| Phase | Channels |
|-------|----------|
| **Launch** | Web Widget + WhatsApp + Telegram |
| **Phase 2** | Discord |
| **Phase 3** | Slack |

---

## Configuration

- Dashboard: Connect, Disconnect, Verify, Test, Rotate Token
- API: Create, Update, Delete, Verify, Deploy

---

## Gateway Architecture

```
gateway/
├── gateway.service.ts
├── router.ts
├── normalizer.ts
├── sender.ts
├── types.ts
└── adapters/
    ├── web.ts
    ├── whatsapp.ts
    ├── telegram.ts
    ├── discord.ts
    └── slack.ts
```

---

## Message Flow

```
Incoming Message
      │
      ▼
Channel Adapter
      │
      ▼
Normalizer
      │
      ▼
Router
      │
      ▼
Agent
      │
      ▼
Sender
      │
      ▼
Channel Adapter
```

---

## Normalized Message Format

```typescript
interface ChannelMessage {
  channel: "web" | "whatsapp" | "telegram" | "discord" | "slack";
  conversationId: string;
  userId: string;
  text: string;
  attachments?: Attachment[];
  metadata: {
    messageId: string;
    timestamp: Date;
    raw: unknown;
  };
}
```

---

## Channel Capabilities

```typescript
interface ChannelCapabilities {
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsFiles: boolean;
  supportsButtons: boolean;
  supportsMarkdown: boolean;
  supportsTypingIndicator: boolean;
  supportsReactions: boolean;
  supportsVoice: boolean;
}
```

| Capability | Web | WhatsApp | Telegram | Discord | Slack |
|------------|-----|----------|----------|---------|-------|
| Streaming | ✅ | ❌ | ❌ | ❌ | ❌ |
| Images | ✅ | ✅ | ✅ | ✅ | ✅ |
| Files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Buttons | ✅ | ✅ | ✅ | ✅ | ✅ |
| Markdown | ✅ | ❌ | ✅ | ✅ | ✅ |
| Typing Indicator | ✅ | ❌ | ✅ | ✅ | ✅ |
| Reactions | ❌ | ❌ | ✅ | ✅ | ✅ |
| Voice | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Channel Features

### Web Widget (Launch)

- Theme colors
- Logo
- Welcome message
- Suggested prompts
- File upload
- Typing indicator
- Streaming
- Markdown
- Sources
- Conversation history
- Mobile responsive

### WhatsApp (Launch)

- Text
- Images
- Files
- Buttons (where supported)
- Templates
- Voice understanding (later)

### Telegram (Launch)

- Text
- Images
- Files
- Markdown
- Inline buttons

---

## Deployments Module

```
deployments/
├── deployments.service.ts
├── deployments.routes.ts
├── deployments.schema.ts
└── health.service.ts
```

### Tracks

- Which bot deployed to which channel
- Deployment status
- Last sync
- Webhook health
- Verification status
- Last error
- Deployment logs

---

## Adding New Channels

New channel = 2 files:

1. `adapters/new-channel.ts` — implement adapter
2. `capabilities/new-channel.ts` — define capabilities

No changes to gateway core.
