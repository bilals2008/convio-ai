const ORB_CONFIGS = [
  'top-[10%] left-[8%] size-1.5 bg-primary/30 [animation-delay:0s]',
  'top-[25%] right-[12%] size-1 bg-primary/20 [animation-delay:1.5s]',
  'bottom-[20%] left-[15%] size-1 bg-primary/25 [animation-delay:3s]',
  'top-[60%] right-[8%] size-1.5 bg-primary/15 [animation-delay:4.5s]',
  'bottom-[35%] left-[45%] size-1 bg-primary/20 [animation-delay:2s]',
  'top-[15%] left-[65%] size-1 bg-primary/15 [animation-delay:5s]',
  'bottom-[10%] right-[25%] size-1.5 bg-primary/20 [animation-delay:3.5s]',
  'top-[70%] left-[25%] size-1 bg-primary/15 [animation-delay:1s]',
]

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {ORB_CONFIGS.map((config, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float ${config}`}
        />
      ))}
    </div>
  )
}
