import { Navbar, HeroSection, TrustedBySection, EverythingSection, Pricing, CTA, Footer } from '@/components/landing'
import { ChatWidget } from '@/components/widget'

const LANDING_AGENT_ID = import.meta.env.VITE_LANDING_WIDGET_AGENT_ID || ''

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <EverythingSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      {LANDING_AGENT_ID && (
        <ChatWidget
          agentId={LANDING_AGENT_ID}
          greeting="Hey! 👋 Welcome to Convio. Ask me anything — features, pricing, docs, whatever you need."
          agentName="Convio Assistant"
          theme={{
            primaryColor: '#fb923c',
            backgroundColor: '#1c1c1c',
            textColor: '#f3f4f6',
          }}
        />
      )}
    </div>
  )
}
