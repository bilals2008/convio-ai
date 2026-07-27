export interface WidgetDetail {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused'
  publicKey: string
  allowedDomains: string[]
  config: WidgetConfig
  agent: { id: string; name: string; avatar?: string | null }
}

export interface WidgetConfig {
  greeting?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  promptBgColor?: string
  headerGradientStart?: string
  headerGradientEnd?: string
  headerGradientDirection?: number
  borderColor?: string
  inputBgColor?: string
  sendBtnColor?: string
  position?: 'bottom-right' | 'bottom-left'
  widgetHeight?: number
  agentName?: string
  agentAvatar?: string
}

export interface ApiError {
  response?: {
    status?: number
    data?: {
      details?: Array<{ message: string }>
    }
  }
  message?: string
}
