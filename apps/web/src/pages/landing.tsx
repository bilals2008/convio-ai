import { Navbar, HeroSection, TrustedBySection, ChannelsSection, Pricing, CTA, Footer } from '@/components/landing'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ChannelsSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
