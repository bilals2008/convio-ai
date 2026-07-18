const COMPANIES = [
  { name: 'Linear', src: 'https://cdn.simpleicons.org/linear/5E6AD2', invertDark: false },
  { name: 'Notion', src: 'https://cdn.simpleicons.org/notion', invertDark: true },
  { name: 'Vercel', src: 'https://cdn.simpleicons.org/vercel', invertDark: true },
  { name: 'Resend', src: 'https://cdn.simpleicons.org/resend', invertDark: true },
  { name: 'PlanetScale', src: 'https://cdn.simpleicons.org/planetscale', invertDark: true },
  { name: 'Railway', src: 'https://cdn.simpleicons.org/railway', invertDark: true },
  { name: 'Supabase', src: 'https://cdn.simpleicons.org/supabase/3FCF8E', invertDark: false },
  { name: 'Prisma', src: 'https://cdn.simpleicons.org/prisma', invertDark: true },
]

function CompanyLogo({ company }: { company: (typeof COMPANIES)[number] }) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      <img
        src={company.src}
        alt={company.name}
        className={`size-7 ${company.invertDark ? 'dark:invert' : ''}`}
      />
      <span className="text-[15px] font-medium text-foreground/70">{company.name}</span>
    </div>
  )
}

export function TrustedBySection() {
  return (
    <section className="border-b border-border bg-background py-10 md:py-14">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10">
        <p className="mb-8 text-center text-[13px] tracking-wide text-muted-foreground uppercase">
          Trusted by fast-growing teams
        </p>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee gap-12">
            {/* First set */}
            {COMPANIES.map((company) => (
              <CompanyLogo key={company.name} company={company} />
            ))}
            {/* Duplicate for seamless loop */}
            {COMPANIES.map((company) => (
              <CompanyLogo key={`${company.name}-dup`} company={company} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
