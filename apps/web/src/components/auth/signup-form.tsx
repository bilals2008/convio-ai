import { useState } from 'react'
import { Eye, EyeOff, Loader2, XCircle, Mail, Lock, User, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SocialLoginButtons } from './social-login-buttons'
import { useAuth } from '@/lib/auth-context'
import { passwordStrength } from '@/lib/password-strength'
import { cn } from '@/lib/utils'

export function SignupForm({ plan, billing }: { plan?: string; billing?: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const { signup } = useAuth()

  const strength = passwordStrength(password)
  const passwordsMatch = confirmPassword ? password === confirmPassword : true

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (strength.segments < 4) {
      setError('Password too weak — use 8+ characters with upper & lowercase letters, a number, and a special character')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreed) {
      setError('You must agree to the Terms of Service')
      return
    }

    signup.mutate(
      { email, password, name },
      {
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data
          setError(msg?.error || msg?.message || 'Failed to create account')
        },
        onSuccess: () => {
          if (plan) {
            const params = new URLSearchParams()
            params.set('plan', plan)
            if (billing) params.set('billing', billing)
            sessionStorage.setItem('pendingBillingRedirect', params.toString())
          }
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={signup.isPending}
            className="pl-10"
          />
        </div>
      </div>

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
            disabled={signup.isPending}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={signup.isPending}
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
        {password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-300',
                    seg <= strength.segments ? strength.color : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className={cn(
              'text-xs font-medium transition-colors duration-300',
              strength.segments <= 1 && 'text-destructive',
              strength.segments === 2 && 'text-warning',
              strength.segments === 3 && 'text-info',
              strength.segments === 4 && 'text-success',
            )}>
              {strength.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Use 8+ characters with upper & lowercase letters, a number, and a special character
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={signup.isPending}
            className="pl-10"
          />
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 rounded border-input cursor-pointer accent-primary"
        />
        <Label htmlFor="terms" className="text-sm max-sm:text-xs font-normal cursor-pointer leading-normal">
          I agree to the{' '}
          <a href="/terms" target="_blank" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </a>
        </Label>
      </div>

      <Button
        type="submit"
        className={cn('w-full h-11 text-sm font-semibold transition-all', signup.isPending && 'opacity-70')}
        disabled={signup.isPending}
      >
        {signup.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span className="ml-2">Creating account...</span>
          </>
        ) : (
          'Create account'
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
