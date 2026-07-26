import { Navbar, Footer } from '@/components/landing'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'

const sections = [
  {
    title: '1. Information We Collect',
    content:
      'When you create an account, we collect your name, email address, and billing information. When you use the Service, we collect data about your agents, conversations, knowledge bases, and configuration settings. We also collect usage data such as page views, feature interactions, and error reports to improve the Service.',
  },
  {
    title: '2. How We Use Your Information',
    content:
      'We use your information to provide, maintain, and improve the Service. This includes processing conversations through AI models, generating analytics, sending service-related communications, and providing customer support. We do not use your conversation data to train or improve third-party AI models without explicit consent.',
  },
  {
    title: '3. Data Sharing & Disclosure',
    content:
      'We do not sell your personal information. We may share data with trusted third-party service providers who help us operate the platform (e.g., cloud hosting, AI model providers, payment processing). These providers are contractually obligated to protect your data. We may disclose information if required by law or to protect our rights.',
  },
  {
    title: '4. Data Retention',
    content:
      'We retain your account information for as long as your account is active. Conversation data is retained according to your organization\'s data retention settings (configurable in your dashboard). When you delete data or terminate your account, we permanently delete the information within 30 days, except where legal obligations require longer retention.',
  },
  {
    title: '5. Data Security',
    content:
      'We implement industry-standard security measures including encryption in transit (TLS 1.3) and at rest (AES-256), access controls, and regular security audits. However, no system is 100% secure. You are responsible for maintaining the security of your account credentials.',
  },
  {
    title: '6. AI Model Data Handling',
    content:
      'When you use our AI agents, conversation data may be processed by third-party AI model providers (e.g., OpenAI, Anthropic, Google). Data sent to these providers is subject to their respective privacy policies. We recommend reviewing your selected provider\'s data handling practices. You can configure which providers your agents use in the dashboard.',
  },
  {
    title: '7. Your Rights',
    content:
      'Depending on your jurisdiction, you may have the right to access, correct, delete, or port your data. You may also opt out of certain data processing. To exercise these rights, contact us at teambilaldev@gmail.com. We will respond within the timeframe required by applicable law.',
  },
  {
    title: '8. Cookies & Tracking',
    content:
      'We use essential cookies to operate the Service. We also use analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect Service functionality.',
  },
  {
    title: '9. Third-Party Services',
    content:
      'The Service may integrate with third-party services (e.g., WhatsApp, Telegram, Discord, Slack). Your use of these services is subject to their respective privacy policies. We are not responsible for the data practices of third-party platforms.',
  },
  {
    title: '10. Children\'s Privacy',
    content:
      'The Service is not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.',
  },
  {
    title: '11. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. Material changes will be communicated via email or through the Service. Your continued use after changes take effect constitutes acceptance of the updated policy.',
  },
  {
    title: '12. Contact Us',
    content:
      'If you have questions about this Privacy Policy or our data practices, please contact us at teambilaldev@gmail.com or visit our contact page.',
  },
]

export default function PrivacyPage() {
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
                title="Privacy Policy"
                description="How Convio collects, uses, and protects your personal data. Your privacy matters to us."
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
