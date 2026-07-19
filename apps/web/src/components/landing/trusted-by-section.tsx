import { FloatingOrbs } from './floating-orbs'

const COMPANIES = [
  { name: 'Akiflow', src: 'https://cdn.simpleicons.org/akiflow', invertDark: false },
  { name: 'Appsmith', src: 'https://cdn.simpleicons.org/appsmith', invertDark: false },
  { name: 'Directus', src: 'https://cdn.simpleicons.org/directus', invertDark: false },
  { name: 'Formbricks', src: 'https://cdn.simpleicons.org/formbricks', invertDark: false },
  { name: 'Listmonk', src: 'https://cdn.simpleicons.org/listmonk', invertDark: false },
  { name: 'NocoDB', src: 'https://cdn.simpleicons.org/nocodb', invertDark: false },
  { name: 'Plane', src: 'https://cdn.simpleicons.org/plane', invertDark: false },
  { name: 'Gitea', src: 'https://cdn.simpleicons.org/gitea', invertDark: false },
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
    <section className="relative overflow-hidden border-b border-border bg-background py-10 md:py-14">
      <FloatingOrbs />

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
