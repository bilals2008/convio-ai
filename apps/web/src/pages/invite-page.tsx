import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import api, { publicApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/loading'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface InvitationData {
  email: string
  role: string
  organization: { id: string; name: string; logo?: string }
  invitedBy: string
}

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const res = await publicApi.get(`/invitations/${token}`)
      return res.data.data as InvitationData
    },
    enabled: !!token,
    retry: false,
  })

  const acceptMutation = useMutation({
    mutationFn: () => api.post(`/invitations/${token}/accept`),
    onSuccess: (res) => {
      toast.success(`You've joined ${invitation?.organization.name}!`)
      queryClient.invalidateQueries({ queryKey: ['members'] })
      const orgId = res.data?.data?.organizationId as string
      if (orgId) {
        navigate(`/settings/team?orgId=${orgId}`)
      } else {
        navigate('/dashboard')
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to accept invitation')
    },
  })

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <XCircle className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Invalid Link</h1>
          <p className="mt-2 text-sm text-muted-foreground">No invitation token provided.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    const isExpired = (error as { response?: { status?: number } })?.response?.status === 410
    const isAccepted = (error as { response?: { status?: number } })?.response?.status === 400

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <XCircle className="mx-auto size-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">
            {isExpired ? 'Invitation Expired' : isAccepted ? 'Already Accepted' : 'Invalid Invitation'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isExpired
              ? 'This invitation has expired. Ask your team admin to send a new one.'
              : isAccepted
                ? 'This invitation has already been used. Sign in to access your team.'
                : 'This invitation link is invalid or could not be found.'}
          </p>
          <Button className="mt-6" onClick={() => navigate('/login')}>
            Sign in
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">You're Invited!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invitation.invitedBy} invited you to <strong>{invitation.organization.name}</strong>
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-left">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Organization</span>
              <span className="text-sm font-medium">{invitation.organization.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Invited by</span>
              <span className="text-sm font-medium">{invitation.invitedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm font-medium capitalize">{invitation.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{invitation.email}</span>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Accept Invitation
          </Button>
        ) : (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => navigate(`/signup?email=${invitation.email}`)}>
              Sign up to accept
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate(`/login?redirect=/invite?token=${token}`)}
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          This invitation will expire on{' '}
          {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
