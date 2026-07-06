import { Navbar, HeroSection, Features, HowItWorks, Pricing, CTA, Footer } from '@/components/landing'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
