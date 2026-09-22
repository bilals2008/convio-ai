# Convio — Auth

Authentication is provided by **Supabase Auth** (GoTrue). There is no self-hosted session store: the frontend holds the Supabase session, and the API verifies the Bearer access token on every request.

## Pieces

| Concern | Location |
|---|---|
| Login / signup / logout / password reset | `apps/web/src/lib/hooks/useAuth.ts` |
| Passkeys (register, list, rename, delete, sign-in) | `apps/web/src/lib/hooks/use-passkeys.ts` |
| Sessions, password change, sign-out-all | `apps/web/src/lib/hooks/use-security.ts` |
| Supabase browser client | `apps/web/src/lib/supabase.ts` |
| Token verification | `apps/api/src/plugins/auth.ts` |
| JWKS verification helper | `apps/api/src/lib/jwt-verify.ts` |
| Revocation / ban check | `apps/api/src/plugins/session-guard.ts` |
| Org membership + roles | `apps/api/src/plugins/membership.ts` |
| Permission matrix | `packages/types/src/permissions.ts` |
| Profile sync trigger | `packages/database/prisma/setup.sql` |

## Request flow

```
1. User signs in (password, OAuth, or passkey) via supabase-js → session in browser storage
2. Each API call sends  Authorization: Bearer <access_token>
3. API verifies the token (see below), resolves the Profile, and sets request.userId
4. Org routes additionally resolve Membership → role → permissions
5. Sensitive routes re-check the session is still live in auth.sessions
```

## Token verification

`plugins/auth.ts` verifies tokens in one of two modes, chosen automatically:

**JWKS mode (preferred).** When the Supabase project has asymmetric JWT signing keys, the token signature is verified **locally** against `https://<ref>.supabase.co/auth/v1/.well-known/jwks.json` — no Auth server round-trip. Verification pins the algorithm allowlist to `ES256`/`RS256` (a local verifier must never accept `HS256`), and asserts the `iss` and `aud` claims.

**Legacy mode.** Projects still on the shared JWT secret expose no JWKS, so the API falls back to `supabase.auth.getUser()` — identical to the previous behaviour. The mode is detected by probing the JWKS endpoint and re-probed every 10 minutes, so switching to asymmetric keys takes effect without a redeploy.

A failed local verification is final: there is deliberately **no** fallback to `getUser()`, which would spend a network call on attacker-supplied tokens.

> Enable asymmetric keys in **Settings → JWT Signing Keys → Migrate JWT secret → Rotate keys**. See [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys).

### Revocation

Locally verified tokens stay cryptographically valid until they expire, so signature checks alone do not observe a revoked session. `fastify.requireFreshSession` closes that gap with one query against the project's own database:

```sql
select 1
from auth.sessions s
join auth.users u on u.id = s.user_id
where s.id = $session_id
  and s.user_id = $user_id
  and (s.not_after is null or s.not_after > now())
  and (u.banned_until is null or u.banned_until < now())
  and u.deleted_at is null
```

This covers **revoked sessions** (`signOut({ scope: 'others' | 'global' })`), **banned users**, and **deleted accounts**.

Use `fastify.authenticateSensitive` instead of `fastify.authenticate` on routes where a leaked-but-unrevoked token could do lasting damage — billing, provider keys, user deletion, organization membership, data management, and the platform-admin surfaces. It is a drop-in replacement; in legacy mode it skips the extra query because the Auth server already enforced it.

**Keep access token lifetime short** (Auth → Sessions → JWT expiry). The guard only runs on the routes that opt in.

## Passkeys (WebAuthn)

Passwordless sign-in backed by Supabase's passkey support. A passkey is a private key held by the device (or password manager) and unlocked with biometrics, a PIN, or a security key. Sign-in uses discoverable credentials, so no email is required.

| Step | Call |
|---|---|
| Register (signed in) | `supabase.auth.registerPasskey()` |
| Sign in | `supabase.auth.signInWithPasskey()` |
| List / rename / delete | `supabase.auth.passkey.list()` / `.update()` / `.delete()` |

UI: `apps/web/src/components/settings/passkeys-card.tsx` (Settings → Profile) and the passkey button in `apps/web/src/components/auth/login-form.tsx`.

### Requirements

- The client opts in via `auth: { experimental: { passkey: true } }` in `apps/web/src/lib/supabase.ts`. Without it every call returns `passkey_disabled`.
- Server side must be enabled in **Authentication → Passkeys**, with the relying party configured:

| Field | Value |
|---|---|
| RP ID | bare domain, no scheme/port/path, e.g. `convio.app` |
| RP Origins | comma-separated, up to 5. HTTPS required except `localhost` |

> **The RP ID is permanent.** Passkeys are cryptographically bound to it, so changing it invalidates every enrolled passkey. Choose deliberately.

- Registration requires a confirmed, non-anonymous user. Anonymous users and SSO users cannot register passkeys.

Passkey support is marked **experimental** by Supabase; the API may change.

## Roles & permissions

Roles are per-organization, resolved from `Membership`. The matrix lives in `packages/types/src/permissions.ts`.

| Role | Scope |
|---|---|
| **Owner** | Everything, including deleting the organization and billing |
| **Admin** | Manage agents, deployments, integrations, members, provider keys |
| **Member** | Create and edit agents, view conversations |
| **Viewer** | Read-only |

Platform-admin access is separate and granted by email allowlist (`PLATFORM_ADMIN_EMAILS`) or the `AdminGrant` table — see `plugins/admin.ts`.

> Authorization data lives in `app_metadata` / the `Membership` table, **never** in `user_metadata` — that field is user-editable and is only ever used for display values like name and avatar.

## API endpoints

```
GET    /api/auth/me                Current user + platform-admin flag
GET    /api/auth/login-activity    Recent sign-ins (last 20)
POST   /api/auth/login-activity    Record a sign-in
GET    /api/auth/onboarding        Onboarding state
PATCH  /api/auth/onboarding        Update onboarding state
```

Sign-up, sign-in, sign-out, OAuth and password reset are handled by the Supabase client SDK directly — there are no API routes for them.

```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/members
POST   /api/organizations/:id/members
PATCH  /api/organizations/:id/members/:userId/role
DELETE /api/organizations/:id/members/:userId
POST   /api/organizations/:id/invitations
POST   /api/invitations/:token/accept
```

## Environment

Backend (`.env`):

```
SUPABASE_URL=                 # also the JWKS issuer base
SUPABASE_ANON_KEY=            # token verification
SUPABASE_SERVICE_ROLE_KEY=    # admin ops: delete / ban / impersonate
```

Frontend (`apps/web/.env`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Known limitations

- `POST /api/auth/login-activity` is client-triggered and always records `status: 'success'`, so it is a UX/display trail, **not** a security record. Failed attempts are not captured. Server-side attempt tracking is not implemented.
- Session history shown in the UI is decoded client-side from the JWT for display only; it is never used for an authorization decision.
- Multi-factor (TOTP) is not implemented. Passkeys are the only second-factor-grade option today.
- `useLogout` calls `supabase.auth.signOut()`, whose SDK default scope is `global` — that signs the user out on **every** device, not just the current one.
