import { Navbar, HeroSection, TrustedBySection, EverythingSection, Pricing, CTA, Footer } from '@/components/landing'

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
    </div>
  )
}
