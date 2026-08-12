import { useQuery } from '@tanstack/react-query'
import { Navbar, HeroSection, TrustedBySection, ChannelsSection, EverythingSection, Pricing, CTA, Footer } from '@/components/landing'
import { ChatWidget } from '@/components/widget'
import { BetaNotice } from '@/components/landing/beta-notice'
import { publicApi } from '@/lib/api'

const LANDING_WIDGET_KEY = import.meta.env.VITE_LANDING_WIDGET_KEY || ''

export default function Landing() {
  const { data: widgetConfig } = useQuery({
    queryKey: ['landing-widget'],
    queryFn: async () => (await publicApi.get(`/public/widgets/${LANDING_WIDGET_KEY}`)).data.data,
    enabled: !!LANDING_WIDGET_KEY,
    staleTime: 5 * 60 * 1000,
  })

  const agentId = widgetConfig?.agent?.id || ''
  const config = widgetConfig?.config || {}

  return (
    <div className="min-h-screen bg-background">
      <BetaNotice />
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ChannelsSection />
        <EverythingSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      {agentId && (
        <ChatWidget
          agentId={agentId}
          publicKey={LANDING_WIDGET_KEY}
          position={config.position || 'bottom-right'}
          greeting={config.greeting || 'Hey there! Welcome to Convio. Ask me anything!'}
          agentName={config.agentName || widgetConfig?.agent?.name || 'Convio Assistant'}
          agentAvatar={config.agentAvatar || widgetConfig?.agent?.avatar}
          quickReplies={config.quickReplies}
          themeMode={config.themeMode || 'auto'}
          headerGradient={config.headerGradient !== false}
          headerTitle={config.headerTitle || undefined}
          headerSubtitle={config.headerSubtitle || undefined}
          showOnlineIndicator={config.showOnlineIndicator}
          launcherLabel={config.launcherLabel || undefined}
          placeholderText={config.placeholderText || undefined}
          showPoweredBy={config.showPoweredBy}
          theme={{
            primaryColor: config.primaryColor || '#1cca4a',
            backgroundColor: config.backgroundColor || '#1c1c1c',
            textColor: config.textColor || '#f3f4f6',
            promptBgColor: config.promptBgColor || '#2a2a2a',
            headerGradientStart: config.headerGradientStart || '#1cca4a',
            headerGradientEnd: config.headerGradientEnd || '#0d7a34',
            headerGradientDirection: `${config.headerGradientDirection ?? 135}deg`,
            borderColor: config.borderColor || '',
            inputBgColor: config.inputBgColor || '',
            sendBtnColor: config.sendBtnColor || '',
            footerBgColor: config.footerBgColor || '',
          }}
        />
      )}
    </div>
  )
}
