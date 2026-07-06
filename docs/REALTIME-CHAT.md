# Convio — Real-time Chat Architecture

## Technology Stack

| Feature | Technology |
|---------|------------|
| AI Response Streaming | SSE (Server-Sent Events) |
| Chat Updates | Supabase Realtime |
| Presence | Supabase Realtime |
| Typing Indicator | Supabase Realtime |
| Read Receipts | Supabase Realtime |
| Notifications | Supabase Realtime |

---

## Message Flow

```
User
   │
   ▼
POST /messages
   │
   ▼
API
   │
   ├── Save user message
   ├── Start AI
   └── Open SSE stream
             │
             ▼
        Token Streaming
             │
             ▼
        Browser updates UI

Meanwhile

Database
   │
   ▼
Supabase Realtime
   │
   ▼
Other browser tabs / agents receive updates
```

---

## Presence

### User Status

- online
- offline
- lastSeen

### Conversation Status

- active users
- active agents

---

## Typing Indicator

### Events

- `typing:start`
- `typing:stop`

### Auto Stop

- 3–5 sec inactivity
- message send
- disconnect

---

## Message Lifecycle

```
sending
   │
   ▼
sent
   │
   ▼
delivered
   │
   ▼
read
```

---

## SSE Scope

SSE sirf AI token streaming ke liye:

```
Hello
Hello,
Hello, how
Hello, how can
Hello, how can I help...
```

Message complete hote hi DB update ho aur Realtime event fire ho.

---

## Reconnection

### SSE

- Auto reconnect
- Last event id
- Continue stream agar possible

### Supabase Realtime

- Automatic reconnect
- Resubscribe channels

---

## Multiple Tabs

Agar user ke 3 tabs khule hain:

1. Message ek hi baar DB mein save
2. Realtime sab tabs ko sync kare

---

## Scaling

State server memory mein mat rakho.

Use:

- PostgreSQL
- Supabase Realtime
- Redis (future)

Multiple backend instances bina issue ke chalenge.

---

## Event Types

```
conversation.created
conversation.updated

message.created
message.updated
message.deleted

typing.start
typing.stop

presence.online
presence.offline

bot.updated
agent.updated

knowledge.processing
knowledge.ready
knowledge.failed
```

---

## Realtime Module

```
realtime/
├── realtime.service.ts
├── presence.ts
├── typing.ts
├── events.ts
└── channels.ts
```

---

## Key Decisions

1. SSE for AI streaming only
2. Supabase Realtime for all other real-time features
3. No state in server memory
4. Dedicated realtime module to avoid code duplication
5. Message lifecycle: sending → sent → delivered → read
6. Auto-stop typing indicator on inactivity/send/disconnect
