import { randomUUID } from 'node:crypto'
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js'
import type {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthTokens,
  AuthorizationServerMetadata,
} from '@modelcontextprotocol/sdk/shared/auth.js'
import { prisma, Prisma } from '@convio/database'
import { getEncryptionKey, encryptJson, decryptJson } from './crypto.js'

/**
 * Shape persisted in McpServer.oauthState (JSON column).
 */
export interface McpOAuthState {
  clientInformation?: OAuthClientInformationMixed
  tokens?: OAuthTokens
  codeVerifier?: string
  state?: string
  discovery?: {
    authorizationServerUrl: string
    authorizationServerMetadata?: AuthorizationServerMetadata
  }
  tokensEncrypted?: string
  tokenExpiresAt?: number
  lastError?: string
}

const CALLBACK_PATH = '/api/mcp/oauth/callback'

/**
 * OAuthClientProvider that persists everything into the McpServer.oauthState JSON column,
 * so the browser redirect round-trip can be resumed from any API instance.
 */
export class DbOAuthClientProvider implements OAuthClientProvider {
  readonly serverId: string
  readonly callbackUrl: string
  private readonly encKey: Buffer | null
  pendingAuthUrl?: string

  constructor(serverId: string, callbackBaseUrl: string, encryptionKey?: string) {
    this.serverId = serverId
    this.callbackUrl = `${callbackBaseUrl.replace(/\/$/, '')}${CALLBACK_PATH}`
    this.encKey = getEncryptionKey(encryptionKey)
  }

  get redirectUrl(): string {
    return this.callbackUrl
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: 'Convio MCP Client',
      redirect_uris: [this.callbackUrl],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    }
  }

  private async load(): Promise<McpOAuthState> {
    const server = await prisma.mcpServer.findUnique({ where: { id: this.serverId } })
    if (!server) throw new Error(`MCP server ${this.serverId} not found`)
    return (server.oauthState as McpOAuthState | null) ?? {}
  }

  private async save(state: McpOAuthState): Promise<void> {
    await prisma.mcpServer.update({
      where: { id: this.serverId },
      data: { oauthState: state as object },
    })
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    const state = await this.load()
    return state.clientInformation
  }

  async saveClientInformation(clientInformation: OAuthClientInformationMixed): Promise<void> {
    const state = await this.load()
    state.clientInformation = clientInformation
    await this.save(state)
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const state = await this.load()
    if (state.tokens) return state.tokens
    if (state.tokensEncrypted && this.encKey) {
      return decryptJson<OAuthTokens>(state.tokensEncrypted, this.encKey)
    }
    return undefined
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    const state = await this.load()
    if (this.encKey) {
      state.tokens = undefined
      state.tokensEncrypted = encryptJson(tokens, this.encKey)
    } else {
      state.tokens = tokens
      state.tokensEncrypted = undefined
    }
    state.tokenExpiresAt = tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined
    state.lastError = undefined
    await this.save(state)
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    const state = await this.load()
    state.codeVerifier = codeVerifier
    await this.save(state)
  }

  async codeVerifier(): Promise<string> {
    const state = await this.load()
    if (!state.codeVerifier) throw new Error('No PKCE code verifier saved for this OAuth flow')
    return state.codeVerifier
  }

  async state(): Promise<string> {
    const token = randomUUID()
    const state = await this.load()
    state.state = token
    await this.save(state)
    return token
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    this.pendingAuthUrl = authorizationUrl.toString()
  }

  async saveDiscoveryState(discovery: McpOAuthState['discovery']): Promise<void> {
    const state = await this.load()
    state.discovery = discovery as McpOAuthState['discovery']
    await this.save(state)
  }

  async discoveryState(): Promise<McpOAuthState['discovery'] | undefined> {
    const state = await this.load()
    return state.discovery
  }

  async saveError(message: string): Promise<void> {
    const state = await this.load()
    state.lastError = message
    await this.save(state)
  }

  async status(): Promise<{ authorized: boolean; hasRefreshToken: boolean; tokenExpiresAt?: number; lastError?: string }> {
    const state = await this.load()
    const tokens = await this.tokens().catch(() => undefined)
    return {
      authorized: Boolean(tokens?.access_token),
      hasRefreshToken: Boolean(tokens?.refresh_token),
      tokenExpiresAt: state.tokenExpiresAt,
      lastError: state.lastError,
    }
  }

  async invalidateCredentials(scope: 'all' | 'client' | 'tokens' | 'verifier' | 'discovery'): Promise<void> {
    const state = await this.load()
    if (scope === 'all' || scope === 'tokens') { state.tokens = undefined; state.tokensEncrypted = undefined; state.tokenExpiresAt = undefined }
    if (scope === 'all' || scope === 'client') state.clientInformation = undefined
    if (scope === 'all' || scope === 'verifier') state.codeVerifier = undefined
    if (scope === 'all' || scope === 'discovery') state.discovery = undefined
    if (scope === 'all') { state.state = undefined; state.lastError = undefined }
    await this.save(state)
  }
}

/**
 * Look up an MCP server by its persisted OAuth state param (used by the callback route).
 */
export async function findMcpServerByOAuthState(stateParam: string) {
  const servers = await prisma.mcpServer.findMany({ where: { oauthState: { not: Prisma.DbNull } } })
  return servers.find((s) => (s.oauthState as McpOAuthState | null)?.state === stateParam) ?? null
}
