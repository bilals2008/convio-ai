import { Navbar, HeroSection, ChannelOrbit, Pricing, CTA, Footer } from '@/components/landing'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ChannelOrbit />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
