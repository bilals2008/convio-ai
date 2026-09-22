import type { WidgetConfig } from '@/components/widgets/types'
import type { ChatWidgetProps } from './ChatWidget'

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

interface PublicWidgetPayload {
  publicKey?: string
  config?: WidgetConfig | null
  agent?: { id: string; name?: string; avatar?: string | null }
}

/** Maps saved widget config onto ChatWidget so embed, landing, and preview stay in sync. */
export function chatWidgetPropsFromConfig(
  widget: PublicWidgetPayload,
  extras: Pick<ChatWidgetProps, 'agentId' | 'publicKey'> &
    Partial<
      Pick<
        ChatWidgetProps,
        'host' | 'visitorId' | 'currentPath' | 'widgetToken' | 'preview'
      >
    >,
): ChatWidgetProps {
  const config = widget.config || {}
  const backgroundColor = config.backgroundColor || '#1c1c1c'
  const quickReplies = (config.quickReplies || []).map((s) => s.trim()).filter(Boolean)

  return {
    agentId: extras.agentId,
    publicKey: extras.publicKey,
    host: extras.host,
    visitorId: extras.visitorId,
    currentPath: extras.currentPath,
    widgetToken: extras.widgetToken,
    preview: extras.preview,
    position: config.position || 'bottom-right',
    greeting: config.greeting || "Hi there! How can I help you today?",
    agentName: config.agentName || widget.agent?.name || 'Assistant',
    agentAvatar: config.agentAvatar || widget.agent?.avatar || undefined,
    quickReplies,
    themeMode: config.themeMode || 'auto',
    widgetWidth: config.widgetWidth || 'default',
    launcherSize: config.launcherSize || 'default',
    borderRadius: config.borderRadius || 'default',
    headerGradient: config.headerGradient !== false,
    headerTitle: config.headerTitle || undefined,
    headerSubtitle: config.headerSubtitle || undefined,
    showOnlineIndicator: config.showOnlineIndicator,
    launcherLabel: config.launcherLabel || undefined,
    placeholderText: config.placeholderText || undefined,
    showPoweredBy: config.showPoweredBy,
    widgetHeight: config.widgetHeight,
    mobileBehavior: config.mobileBehavior || 'default',
    launcherShape: config.launcherShape || 'circle',
    customWidth: config.customWidth,
    customHeight: config.customHeight,
    launcherOffset: config.launcherOffset,
    showTeaser: config.showTeaser !== false,
    teaserMessage: config.teaserMessage || '',
    teaserDelay: config.teaserDelay,
    hiddenPages: config.hiddenPages,
    theme: {
      primaryColor: config.primaryColor || '#1cca4a',
      backgroundColor,
      textColor: config.textColor || (isLightColor(backgroundColor) ? '#1f2937' : '#f3f4f6'),
      promptBgColor: config.promptBgColor || '#2a2a2a',
      headerGradientStart: config.headerGradientStart || '#1cca4a',
      headerGradientEnd: config.headerGradientEnd || '#0d7a34',
      headerGradientDirection: `${config.headerGradientDirection ?? 135}deg`,
      borderColor: config.borderColor || '',
      inputBgColor: config.inputBgColor || '',
      sendBtnColor: config.sendBtnColor || '',
      footerBgColor: config.footerBgColor || '',
      headerTitleColor: config.headerTitleColor || '',
      headerSubtitleColor: config.headerSubtitleColor || '',
      onlineIndicatorColor: config.onlineIndicatorColor || '',
      headerIconColor: config.headerIconColor || '',
    },
  }
}
