import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Check, Type, Heading1, Code2 } from 'lucide-react'

interface FontPairing {
  id: string
  name: string
  heading: { family: string; label: string; weight?: string }
  body: { family: string; label: string; weight?: string }
  mono: { family: string; label: string }
}

const fontPairings: FontPairing[] = [
  {
    id: 'geist',
    name: 'Geist (Vercel)',
    heading: { family: 'var(--font-heading)', label: 'Geist', weight: '700' },
    body: { family: 'var(--font-body)', label: 'Geist', weight: '400' },
    mono: { family: 'var(--font-mono)', label: 'Geist Mono' },
  },
  {
    id: 'inter',
    name: 'Inter (Linear-style)',
    heading: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '600' },
    body: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '400' },
    mono: { family: 'var(--font-jetbrains)', label: 'JetBrains Mono' },
  },
  {
    id: 'space-grotesk-inter',
    name: 'Space Grotesk + Inter',
    heading: { family: 'var(--font-space-grotesk)', label: 'Space Grotesk', weight: '600' },
    body: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '400' },
    mono: { family: 'var(--font-jetbrains)', label: 'JetBrains Mono' },
  },
  {
    id: 'outfit-inter',
    name: 'Outfit + Inter',
    heading: { family: 'var(--font-outfit)', label: 'Outfit Variable', weight: '600' },
    body: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '400' },
    mono: { family: 'var(--font-jetbrains)', label: 'JetBrains Mono' },
  },
  {
    id: 'manrope-inter',
    name: 'Manrope + Inter',
    heading: { family: 'var(--font-manrope)', label: 'Manrope Variable', weight: '600' },
    body: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '400' },
    mono: { family: 'var(--font-jetbrains)', label: 'JetBrains Mono' },
  },
  {
    id: 'dm-sans-inter',
    name: 'DM Sans + Inter',
    heading: { family: 'var(--font-dm-sans)', label: 'DM Sans Variable', weight: '700' },
    body: { family: 'var(--font-inter)', label: 'Inter Variable', weight: '400' },
    mono: { family: 'var(--font-jetbrains)', label: 'JetBrains Mono' },
  },
]

const sampleHeading = 'The quick brown fox jumps over the lazy dog'
const sampleBody = 'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.'
const sampleCode = `const greeting = "Hello, World!";\nconsole.log(greeting);`
const sampleUi = 'Button · Card · Input · Badge · Table'

export default function AdminFontsPage() {
  const [active, setActive] = useState('geist')

  return (
    <div>
      <PageHeader
        title="Font Pairings"
        description="Preview and compare font combinations for your site. Pick one heading, one body, and one mono font."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fontPairings.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`group relative rounded-xl border p-5 text-left transition-all ${
              active === p.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
            }`}
          >
            {active === p.id && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}

            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{p.name}</p>

            {/* Heading preview */}
            <div className="mb-3 flex items-start gap-2">
              <Heading1 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              <p
                className="text-xl leading-tight text-foreground"
                style={{ fontFamily: p.heading.family, fontWeight: p.heading.weight }}
              >
                {sampleHeading}
              </p>
            </div>

            {/* Body preview */}
            <div className="mb-3 flex items-start gap-2">
              <Type className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              <p
                className="text-sm leading-relaxed text-muted-foreground"
                style={{ fontFamily: p.body.family, fontWeight: p.body.weight }}
              >
                {sampleBody}
              </p>
            </div>

            {/* Code preview */}
            <div className="mb-3 flex items-start gap-2">
              <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              <pre
                className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground overflow-x-auto"
                style={{ fontFamily: p.mono.family }}
              >
                {sampleCode}
              </pre>
            </div>

            {/* UI labels preview */}
            <div
              className="flex flex-wrap gap-1.5"
              style={{ fontFamily: p.body.family, fontWeight: '500' }}
            >
              {sampleUi.split(' · ').map((label) => (
                <span key={label} className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {label}
                </span>
              ))}
            </div>

            {/* Font labels */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-3">
              <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                H: {p.heading.label}
              </span>
              <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                B: {p.body.label}
              </span>
              <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                M: {p.mono.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Full preview section */}
      <div className="mt-8 rounded-xl border border-border/60 bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Full Preview — {fontPairings.find((p) => p.id === active)?.name}</h2>
        {(() => {
          const p = fontPairings.find((pp) => pp.id === active)!
          return (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground/60 mb-1">Heading</p>
                <h1
                  className="text-3xl tracking-tight text-foreground"
                  style={{ fontFamily: p.heading.family, fontWeight: p.heading.weight }}
                >
                  Building great experiences
                </h1>
                <h2
                  className="text-xl tracking-tight text-foreground mt-2"
                  style={{ fontFamily: p.heading.family, fontWeight: p.heading.weight }}
                >
                  Starts with great typography
                </h2>
                <h3
                  className="text-base tracking-tight text-foreground mt-2"
                  style={{ fontFamily: p.heading.family, fontWeight: p.heading.weight }}
                >
                  Every detail matters
                </h3>
              </div>

              <div>
                <p className="text-xs text-muted-foreground/60 mb-1">Body</p>
                <p
                  className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground"
                  style={{ fontFamily: p.body.family, fontWeight: p.body.weight }}
                >
                  {sampleBody}
                </p>
                <p
                  className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground mt-2"
                  style={{ fontFamily: p.body.family, fontWeight: p.body.weight }}
                >
                  Good typography creates hierarchy, establishes brand identity, and guides the reader through content naturally. It's one of the most important design decisions you'll make.
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground/60 mb-1">Code</p>
                <pre
                  className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground max-w-lg overflow-x-auto"
                  style={{ fontFamily: p.mono.family }}
                >
                  {sampleCode}
                </pre>
              </div>

              <div>
                <p className="text-xs text-muted-foreground/60 mb-1">UI Elements</p>
                <div
                  className="flex flex-wrap gap-2"
                  style={{ fontFamily: p.body.family, fontWeight: '500' }}
                >
                  <span className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Primary</span>
                  <span className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">Secondary</span>
                  <span className="rounded-md bg-destructive px-3 py-1.5 text-xs text-destructive-foreground">Destructive</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground">Badge</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
