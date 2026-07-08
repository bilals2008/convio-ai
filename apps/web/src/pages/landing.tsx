import { Navbar, HeroSection, Features, ChatPreview, Channels, ChannelOrbit, Pricing, CTA, Footer } from '@/components/landing'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        <ChatPreview />
        <Channels />
        <ChannelOrbit />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
