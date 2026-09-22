/**
 * Flat, near-monochrome hero backdrop: a faint dot texture and a single soft
 * primary wash, both faded with CSS masks (no gradient fills).
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 bg-dot-pattern opacity-40"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 10%, transparent 75%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[520px] bg-primary/[0.05]"
        style={{
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 0%, #000 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 0%, #000 0%, transparent 72%)',
        }}
      />
    </div>
  )
}
