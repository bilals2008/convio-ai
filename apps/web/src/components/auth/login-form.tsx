import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, XCircle, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SocialLoginButtons } from './social-login-buttons'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    login.mutate(
      { email, password, redirectTo },
      {
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data
          setError(msg?.error || msg?.message || 'Invalid email or password')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
          <XCircle className="size-4 mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
          >
            <XCircle className="size-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={login.isPending}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={login.isPending}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className={cn('w-full h-11 text-sm font-semibold transition-all', login.isPending && 'opacity-70')}
        disabled={login.isPending}
      >
        {login.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span className="ml-2">Signing in...</span>
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <SocialLoginButtons />
    </form>
  )
}
