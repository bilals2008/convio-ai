export interface DiscordInteraction {
  id: string
  application_id: string
  type: number
  token?: string
  channel_id?: string
  guild_id?: string
  member?: {
    user?: { id: string; username?: string; global_name?: string }
    roles?: string[]
  }
  user?: { id: string; username?: string; global_name?: string }
  data?: {
    name?: string
    options?: Array<{ name: string; type: number; value?: string }>
    custom_id?: string
    component_type?: number
    values?: string[]
    components?: Array<Record<string, unknown>>
  }
  message?: {
    id?: string
    content?: string
    author?: { id: string }
  }
}

export interface DiscordWebhookBody {
  embeds?: Array<{
    title?: string
    description?: string
    color?: number
    footer?: { text: string }
  }>
  components?: Array<Record<string, unknown>>
  flags?: number
}

export interface MessageComponent {
  type: number
  style?: number
  label?: string
  emoji?: { name: string }
  custom_id?: string
  url?: string
  disabled?: boolean
}

export interface ActionRow {
  type: number
  components: MessageComponent[]
}

export type InteractionResponse = {
  type: number
  data?: {
    content?: string
    flags?: number
    components?: ActionRow[]
    embeds?: Array<Record<string, unknown>>
  }
}
