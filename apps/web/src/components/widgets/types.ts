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
  headerTitleColor?: string
  headerSubtitleColor?: string
  onlineIndicatorColor?: string
  headerIconColor?: string
  showOnlineIndicator?: boolean
  launcherLabel?: string
  placeholderText?: string
  showPoweredBy?: boolean
  quickReplies?: string[]
  mobileBehavior?: 'default' | 'fullscreen'
  launcherShape?: 'circle' | 'pill' | 'square'
  customWidth?: number
  customHeight?: number
  launcherOffset?: number
  showTeaser?: boolean
  teaserMessage?: string
  teaserDelay?: number
  hiddenPages?: string[]
}

export interface WidgetDraft {
  name?: string
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
  headerTitle?: string
  headerSubtitle?: string
  headerTitleColor?: string
  headerSubtitleColor?: string
  onlineIndicatorColor?: string
  headerIconColor?: string
  agentName?: string
  placeholderText?: string
  quickReplies?: string[]
  themeMode?: 'auto' | 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left'
  widgetWidth?: 'narrow' | 'default' | 'wide'
  launcherSize?: 'small' | 'default' | 'large'
  borderRadius?: 'none' | 'default' | 'full'
}

export interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
      details?: Array<{ message: string }>
    }
  }
  message?: string
}
