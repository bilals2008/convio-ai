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
  headerGradient?: boolean
  borderColor?: string
  inputBgColor?: string
  sendBtnColor?: string
  footerBgColor?: string
  position?: 'bottom-right' | 'bottom-left'
  widgetHeight?: number
  widgetWidth?: 'narrow' | 'default' | 'wide'
  launcherSize?: 'small' | 'default' | 'large'
  borderRadius?: 'none' | 'default' | 'full'
  agentName?: string
  agentAvatar?: string
  themeMode?: 'auto' | 'light' | 'dark'
  headerTitle?: string
  headerSubtitle?: string
  showOnlineIndicator?: boolean
  launcherLabel?: string
  placeholderText?: string
  showPoweredBy?: boolean
  quickReplies?: string[]
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
