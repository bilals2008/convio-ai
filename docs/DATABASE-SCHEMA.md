# Convio — Database Schema

## Entity Relationship

```
User ──┬── Membership ──── Organization
       │
       └── Bot (created_by)
              │
              ├── Agent (linked)
              │      ├── Tool (many-to-many)
              │      └── KnowledgeBase (many)
              │             └── Document (many)
              │
              ├── Conversation (many)
              │      └── Message (many)
              │
              ├── Integration (many)
              │
              └── Analytics (many)
```

## Models

### User

- id (UUID)
- name (String)
- email (String, unique)
- avatar (String, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Organization

- id (UUID)
- name (String)
- slug (String, unique)
- logo (String, optional)
- plan (Enum: free, pro, enterprise)
- createdAt (DateTime)
- updatedAt (DateTime)

### Membership

- id (UUID)
- userId (FK → User)
- organizationId (FK → Organization)
- role (Enum: owner, admin, member, viewer)
- createdAt (DateTime)

### Agent

- id (UUID)
- organizationId (FK → Organization)
- name (String)
- description (String, optional)
- model (Enum: gpt-4, gpt-4o, claude-3, etc.)
- systemPrompt (Text)
- temperature (Float, default: 0.7)
- maxTokens (Integer, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Bot

- id (UUID)
- organizationId (FK → Organization)
- agentId (FK → Agent)
- name (String)
- description (String, optional)
- avatar (String, optional)
- widgetColor (String, default: #fb923c)
- welcomeMessage (Text, optional)
- status (Enum: active, inactive, draft)
- createdAt (DateTime)
- updatedAt (DateTime)

### Conversation

- id (UUID)
- botId (FK → Bot)
- userId (String, optional — anonymous users)
- channel (Enum: web, whatsapp, telegram, discord, slack)
- status (Enum: active, closed, transferred)
- createdAt (DateTime)
- updatedAt (DateTime)

### Message

- id (UUID)
- conversationId (FK → Conversation)
- role (Enum: user, assistant, system)
- content (Text)
- metadata (JSON, optional)
- createdAt (DateTime)

### KnowledgeBase

- id (UUID)
- organizationId (FK → Organization)
- name (String)
- description (String, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Document

- id (UUID)
- knowledgeBaseId (FK → KnowledgeBase)
- name (String)
- type (Enum: pdf, txt, md, url, csv)
- content (Text, optional)
- url (String, optional)
- embedding (Vector, optional — pgvector)
- status (Enum: pending, processing, ready, failed)
- createdAt (DateTime)

### Tool

- id (UUID)
- organizationId (FK → Organization)
- name (String)
- description (String)
- type (Enum: search, calculator, api, code, custom)
- config (JSON)
- createdAt (DateTime)

### AgentTool (Many-to-Many)

- agentId (FK → Agent)
- toolId (FK → Tool)

### Integration

- id (UUID)
- botId (FK → Bot)
- channel (Enum: whatsapp, telegram, discord, slack)
- config (JSON — channel-specific settings)
- status (Enum: active, inactive, error)
- createdAt (DateTime)

### Analytics

- id (UUID)
- botId (FK → Bot)
- date (Date)
- totalConversations (Integer)
- totalMessages (Integer)
- uniqueUsers (Integer)
- avgResponseTime (Float)
- satisfactionScore (Float, optional)
- createdAt (DateTime)

## Key Decisions

1. Bot → Agent: Many-to-One (multiple bots can share same agent)
2. Tool: Separate model for reusability across agents
3. KnowledgeBase: Collections of documents, linked to organization
4. Message: Stores full conversation history with metadata
5. Analytics: Daily aggregated metrics per bot
6. Integration: Channel-specific configs stored as JSON
