import { useQuery } from '@tanstack/react-query'
import { Navbar, HeroSection, HowItWorks, ChannelsSection, EverythingSection, Pricing, CTA, Footer } from '@/components/landing'
import { ChatWidget, chatWidgetPropsFromConfig } from '@/components/widget'
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <ChannelsSection />
        <EverythingSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      {agentId && (
        <ChatWidget
          {...chatWidgetPropsFromConfig(widgetConfig, {
            agentId,
            publicKey: LANDING_WIDGET_KEY,
          })}
        />
      )}
    </div>
  )
}
