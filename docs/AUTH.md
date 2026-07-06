# Convio — Auth Flow

## Implementation

Better Auth with organization plugin.

## Features

- Email/Password authentication
- OAuth (Google, GitHub)
- Multi-tenant organizations
- Role-based access control
- Cookie-based sessions

## Auth Flow

```
1. User signs up → Better Auth creates user
2. User creates organization → Organization + Membership created
3. User invites team → Invitation sent via email
4. Team member joins → Membership created with role
5. API requests → Session validated, org context extracted
```

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Owner** | Everything + delete org + billing |
| **Admin** | Manage agents, bots, integrations |
| **Member** | Create/edit agents, bots, view conversations |
| **Viewer** | Read-only access |

## Endpoints

```
POST   /api/auth/sign-up/email
POST   /api/auth/sign-in/email
POST   /api/auth/sign-out
GET    /api/auth/session
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

## Organization Endpoints

```
GET    /organizations
POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id
DELETE /organizations/:id
POST   /organizations/:id/invite
POST   /organizations/:id/join
```
