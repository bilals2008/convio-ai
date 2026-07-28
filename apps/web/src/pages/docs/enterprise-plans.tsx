import { Building2, Shield, Phone, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function EnterprisePlansPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Enterprise Plans' },
        ]}
        title="Enterprise Plans"
        description="Custom solutions for large organizations with dedicated support, custom SLAs, and flexible deployment options."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Enterprise plans are built for organizations that need more than standard self-serve offerings. Whether you need unlimited scale, dedicated infrastructure, or custom compliance requirements, Convio's enterprise team works with you to build the right solution.
      </p>

      <h2 id="custom-pricing">Custom Pricing</h2>
      <p>
        Enterprise pricing is tailored to your organization's needs. Factors that influence pricing include:
      </p>
      <ul>
        <li><strong>Message volume:</strong> Higher volumes receive lower per-message rates.</li>
        <li><strong>Number of agents:</strong> Unlimited agents at a flat monthly rate.</li>
        <li><strong>Team size:</strong> Unlimited seats for your entire organization.</li>
        <li><strong>Support level:</strong> From dedicated Slack channels to on-site support.</li>
      </ul>

      <h2 id="dedicated-support">Dedicated Support</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Phone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Dedicated account manager"
          description="A single point of contact who understands your organization and can escalate issues directly to engineering."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Priority response"
          description="Guaranteed response times for critical issues. Non-critical requests handled within 4 business hours."
        />
      </DocCardGrid>

      <h2 id="custom-slas">Custom SLAs</h2>
      <p>
        Enterprise plans include Service Level Agreements tailored to your requirements:
      </p>
      <ul>
        <li><strong>Uptime guarantees:</strong> 99.9% or higher, with credits for downtime.</li>
        <li><strong>Response times:</strong> Custom SLAs for issue resolution.</li>
        <li><strong>Escalation paths:</strong> Direct access to engineering for critical issues.</li>
        <li><strong>Regular reviews:</strong> Quarterly business reviews with your account team.</li>
      </ul>

      <DocCallout variant="info" icon={Shield} title="SLA details">
        Specific SLA terms are negotiated as part of your enterprise agreement. Contact sales for a sample SLA document.
      </DocCallout>

      <h2 id="on-premise">On-Premise Options</h2>
      <p>
        For organizations that require full control over their data and infrastructure, Convio offers on-premise deployment:
      </p>
      <ul>
        <li><strong>Self-hosted:</strong> Deploy Convio on your own infrastructure with full data sovereignty.</li>
        <li><strong>VPC deployment:</strong> Run Convio within your virtual private cloud for maximum security.</li>
        <li><strong>Air-gapped:</strong> Deploy in isolated environments with no external connectivity.</li>
      </ul>

      <DocCallout variant="warning" icon={Building2} title="On-premise requirements">
        On-premise deployments require dedicated infrastructure and engineering resources. Contact our team to discuss requirements and get a cost estimate.
      </DocCallout>

      <h2 id="contact-sales">Contact Sales</h2>
      <p>
        Ready to discuss an enterprise plan? Our sales team will work with you to understand your requirements and build a custom proposal:
      </p>
      <ol>
        <li>Visit <strong>convio.ai/enterprise</strong> or click <strong>Contact Sales</strong> in the dashboard.</li>
        <li>Fill out the form with your organization details and requirements.</li>
        <li>A member of our enterprise team will reach out within 1 business day.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Building2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View All Plans"
          href="/docs/plans"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Plan Features"
          href="/docs/plan-features"
        />
      </DocCardGrid>
    </DocContent>
  )
}
