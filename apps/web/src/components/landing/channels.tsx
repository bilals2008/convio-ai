import { useState, type ReactNode } from 'react'
import { Copy, Check, Globe, Code2, Terminal } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { WhatsAppIcon, TelegramIcon, DiscordIcon } from './channel-icons'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
      className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied ? <><Check className="size-3.5" />Copied</> : <><Copy className="size-3.5" />Copy</>}
    </button>
  )
}

interface CardProps {
  icon: ReactNode
  title: string
  copyText: string
  children: ReactNode
}

function IntegrationCard({ icon, title, copyText, children }: CardProps) {
  return (
    <div className="bg-card rounded-[14px] border border-border flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="text-[12.5px] font-mono leading-[1.7] text-foreground/80 overflow-x-auto whitespace-pre-wrap">{children}</pre>
  )
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
          <span className="size-5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  )
}

const cards = [
  {
    title: 'Web Embed',
    icon: <Globe className="size-[18px] text-primary" />,
    copy: `<script src="https://cdn.convio.ai/widget.js" data-agent="YOUR_AGENT_ID"></script>`,
    content: (
      <CodeBlock>
        {`<script\n  src="https://cdn.convio.ai/widget.js"\n  data-agent="YOUR_AGENT_ID"\n></script>`}
      </CodeBlock>
    ),
  },
  {
    title: 'React',
    icon: <Code2 className="size-[18px] text-primary" />,
    copy: `import { ConvioWidget } from '@convio/react';\n\n<ConvioWidget agentId="YOUR_AGENT_ID" />`,
    content: (
      <CodeBlock>
        {`$ npm i @convio/react\n\nimport { ConvioWidget } from '@convio/react';\n\n<ConvioWidget\n  agentId="YOUR_AGENT_ID"\n/>`}
      </CodeBlock>
    ),
  },
  {
    title: 'REST API',
    icon: <Terminal className="size-[18px] text-primary" />,
    copy: `curl -X POST https://api.convio.ai/v1/chat \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -d '{ "agentId": "YOUR_AGENT_ID", "message": "Hello" }'`,
    content: (
      <CodeBlock>
        {`$ curl -X POST https://api.convio.ai/v1/chat\n  -H "Authorization: Bearer $API_KEY"\n  -d '{ "agentId": "YOUR_AGENT_ID",\n         "message": "Hello" }'`}
      </CodeBlock>
    ),
  },
  {
    title: 'WhatsApp',
    icon: <WhatsAppIcon className="size-[18px]" />,
    copy: '',
    content: (
      <StepList items={[
        'Add your WhatsApp Business number in Dashboard',
        'Scan the QR code to verify ownership',
        'Your agent replies automatically',
      ]} />
    ),
  },
  {
    title: 'Telegram',
    icon: <TelegramIcon className="size-[18px]" />,
    copy: '',
    content: (
      <StepList items={[
        'Create a bot via @BotFather',
        'Paste the token into Convio',
        'Messages stream in real time',
      ]} />
    ),
  },
  {
    title: 'Discord',
    icon: <DiscordIcon className="size-[18px]" />,
    copy: '',
    content: (
      <StepList items={[
        'Add the Convio app to your server',
        'Pick the channels to listen on',
        'Your agent answers in-thread',
      ]} />
    ),
  },
]

export function Channels() {
  return (
    <section id="channels" className="max-w-[1160px] mx-auto px-5 md:px-10 py-16">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">Integrations</div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Works everywhere you do.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Easy integration with Web, React, REST API, and your favourite messaging apps.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
        {cards.map((c, i) => (
          <ScrollReveal key={c.title} delay={(i % 3) * 0.06} className="h-full">
            <IntegrationCard icon={c.icon} title={c.title} copyText={c.copy}>
              {c.content}
            </IntegrationCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
