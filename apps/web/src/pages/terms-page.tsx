import { Navbar, Footer } from '@/components/landing'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using Convio ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Service. We may update these terms at any time, and continued use after changes constitutes acceptance.',
  },
  {
    title: '2. Description of Service',
    content:
      'Convio provides AI-powered customer conversation agents that can be deployed across multiple channels including web widgets, WhatsApp, Telegram, Discord, and Slack. The Service includes agent management, knowledge bases, analytics, and related features as described on our website.',
  },
  {
    title: '3. User Accounts',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and notify us immediately of any unauthorized use. Accounts are granted to individuals; shared accounts are not permitted.',
  },
  {
    title: '4. Acceptable Use',
    content:
      'You agree not to use the Service for any unlawful purpose or in violation of any applicable laws. You may not use the Service to build competing products, reverse-engineer the platform, or transmit malware. We reserve the right to suspend accounts that violate this policy.',
  },
  {
    title: '5. Intellectual Property',
    content:
      'Convio and its licensors own all rights to the platform, including its software, branding, and design. You retain ownership of your data, prompts, knowledge bases, and configurations. You grant us a license to process your data solely to provide the Service.',
  },
  {
    title: '6. Data & Privacy',
    content:
      'Your use of the Service is also governed by our Privacy Policy. We implement industry-standard security measures to protect your data. We do not sell your personal information. Data processing details, including retention and deletion, are described in our Privacy Policy.',
  },
  {
    title: '7. Service Level & Availability',
    content:
      'We strive for high availability but do not guarantee uninterrupted service. Planned maintenance will be communicated when possible. We are not liable for downtime caused by factors outside our reasonable control, including third-party services.',
  },
  {
    title: '8. Billing & Payments',
    content:
      'Paid plans are billed in advance on a monthly or annual basis as selected. Fees are non-refundable except as required by law. We may change pricing with 30 days notice. Non-payment may result in service suspension.',
  },
  {
    title: '9. Termination',
    content:
      'Either party may terminate the agreement at any time. Upon termination, your access to the Service will be revoked. We will retain your data for 30 days after termination, after which it may be permanently deleted unless required otherwise by law.',
  },
  {
    title: '10. Limitation of Liability',
    content:
      'To the maximum extent permitted by law, Convio shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.',
  },
  {
    title: '11. Governing Law',
    content:
      'These terms are governed by the laws of the jurisdiction in which Convio is registered. Any disputes shall be resolved through binding arbitration, and you waive the right to participate in class-action lawsuits.',
  },
  {
    title: '12. Contact',
    content:
      'For questions about these terms, contact us at teambilaldev@gmail.com or via our contact page.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div className="relative mx-auto max-w-[840px] px-5 md:px-10 pt-20 pb-4 md:pt-28 md:pb-8">
            <ScrollReveal variant="fadeUp">
              <SectionHeading
                eyebrow="Legal"
                title="Terms & Conditions"
                description="The rules that govern your use of the Convio platform. By using Convio, you agree to these terms."
              />
            </ScrollReveal>
          </div>
        </section>

        <section className="relative pb-20 md:pb-28">
          <div className="mx-auto max-w-[840px] px-5 md:px-10">
            <div className="space-y-10">
              {sections.map((section, i) => (
                <ScrollReveal key={section.title} variant="fadeUp" delay={i * 0.03}>
                  <article>
                    <h2 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground">
                      {section.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
