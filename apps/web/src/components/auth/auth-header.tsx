import { Link } from 'react-router-dom'

interface AuthHeaderProps {
  title: string
  description: string
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <Link to="/" className="inline-flex items-center justify-center rounded-2xl bg-card border p-3 shadow-sm transition-colors hover:bg-accent">
        <img src="/logo.png" alt="Convio" className="size-9" />
      </Link>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
