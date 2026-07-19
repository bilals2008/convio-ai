import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface InviteEmailProps {
  inviterName: string
  orgName: string
  roleLabel: string
  inviteUrl: string
}

export function InviteEmail({ inviterName, orgName, roleLabel, inviteUrl }: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {orgName} on Convio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>Convio</Text>
          </Section>

          <Section style={card}>
            <Section style={emojiSection}>
              <Text style={emoji}>👋</Text>
            </Section>

            <Heading style={heading}>
              Join <span style={highlight}>{orgName}</span> on Convio
            </Heading>
            <Text style={subtitle}>You've been invited to collaborate with your team</Text>

            <Section style={detailsBox}>
              <table style={detailTable}>
                <tr>
                  <td style={detailLabel}>Invited by</td>
                  <td style={detailValue}>{inviterName}</td>
                </tr>
                <tr>
                  <td style={detailLabelBorder}>Organization</td>
                  <td style={detailValueBorder}>{orgName}</td>
                </tr>
                <tr>
                  <td style={detailLabelBorder}>Role</td>
                  <td style={detailValueBorder}>
                    <span style={roleBadge}>{roleLabel}</span>
                  </td>
                </tr>
              </table>
            </Section>

            <Section style={buttonSection}>
              <Button href={inviteUrl} style={button}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={footerText}>
              This invitation will expire in 7 days. Already have an account? Just sign in and you'll find{' '}
              <strong>{orgName}</strong> waiting for you.
            </Text>
          </Section>

          <Text style={companyTagline}>Convio — AI-powered customer conversations</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  margin: 0,
  padding: 0,
  backgroundColor: '#f4f5f7',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  lineHeight: 1.5,
  color: '#1a1a2e',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 16px',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '0 0 32px',
}

const logoText = {
  display: 'inline-block',
  background: '#1a1a2e',
  borderRadius: '10px',
  padding: '10px 18px',
  fontSize: '18px',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '-0.3px',
}

const card = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '40px 40px 32px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
}

const emojiSection = {
  textAlign: 'center' as const,
  padding: '0 0 8px',
}

const emoji = {
  fontSize: '24px',
  lineHeight: 1,
  margin: 0,
}

const heading = {
  textAlign: 'center' as const,
  fontSize: '22px',
  fontWeight: 700,
  color: '#1a1a2e',
  letterSpacing: '-0.3px',
  margin: '0 0 4px',
}

const highlight = {
  color: '#4f46e5',
}

const subtitle = {
  textAlign: 'center' as const,
  fontSize: '15px',
  color: '#64748b',
  margin: '0 0 24px',
}

const detailsBox = {
  background: '#f8fafc',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '24px',
}

const detailTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const detailLabel = {
  width: '90px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#64748b',
  verticalAlign: 'top' as const,
  padding: '8px 0',
}

const detailValue = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a2e',
  padding: '8px 0',
}

const detailLabelBorder = {
  width: '90px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#64748b',
  verticalAlign: 'top' as const,
  padding: '8px 0',
  borderTop: '1px solid #e2e8f0',
}

const detailValueBorder = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a2e',
  padding: '8px 0',
  borderTop: '1px solid #e2e8f0',
}

const roleBadge = {
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#eef2ff',
  color: '#4f46e5',
}

const buttonSection = {
  textAlign: 'center' as const,
  padding: '0 0 24px',
}

const button = {
  display: 'inline-block',
  padding: '12px 32px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#ffffff',
  background: '#4f46e5',
  textDecoration: 'none',
  letterSpacing: '-0.2px',
}

const footerText = {
  textAlign: 'center' as const,
  fontSize: '13px',
  color: '#94a3b8',
  lineHeight: 1.6,
  margin: 0,
}

const companyTagline = {
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#94a3b8',
  padding: '24px 0 0',
  margin: 0,
}
