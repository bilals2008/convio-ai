import { cn } from '@/lib/utils'

export interface MarqueeBrand {
  name: string
  slug: string
}

const DEFAULT_BRANDS: MarqueeBrand[] = [
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Anthropic', slug: 'anthropic' },
  { name: 'Google', slug: 'google' },
  { name: 'Meta', slug: 'meta' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Slack', slug: 'slack' },
  { name: 'Discord', slug: 'discord' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Notion', slug: 'notion' },
  { name: 'Linear', slug: 'linear' },
  { name: 'Figma', slug: 'figma' },
  { name: 'HubSpot', slug: 'hubspot' },
]

function brandUrl(slug: string) {
  return `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${slug}/default.svg`
}

interface LogoMarqueeProps {
  brands?: MarqueeBrand[]
  label?: string
  className?: string
  speed?: number
}

export function LogoMarquee({
  brands = DEFAULT_BRANDS,
  label = 'Trusted by teams at',
  className,
  speed = 40,
}: LogoMarqueeProps) {
  const loop = [...brands, ...brands]

  return (
    <div className={cn('w-full select-none', className)}>
      {label && (
        <span className="block text-center text-[10px] tracking-[0.15em] text-muted-foreground/60 uppercase font-semibold mb-4">
          {label}
        </span>
      )}
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className="flex w-max items-center gap-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{
            animation: `logo-marquee ${speed}s linear infinite`,
          }}
        >
          {loop.map((b, i) => (
            <img
              key={`${b.slug}-${i}`}
              src={brandUrl(b.slug)}
              alt={b.name}
              loading="lazy"
              aria-hidden={i >= brands.length}
              className="h-7 w-auto shrink-0 opacity-70 transition-all duration-300 hover:opacity-100"
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes logo-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
