import { useLocation } from 'react-router-dom'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useOrg } from '@/lib/org-context'
import { useDocFeedback, useSubmitDocFeedback } from '@/lib/hooks/use-doc-feedback'

export function DocFeedback() {
  const { pathname } = useLocation()
  const { orgId } = useOrg()
  const slug = pathname.split('/').filter(Boolean).join('/') || 'docs'

  const { data, isLoading } = useDocFeedback(orgId, slug)
  const mutation = useSubmitDocFeedback(orgId ?? undefined, slug)

  const vote = (helpful: boolean) => {
    mutation.mutate(
      { helpful },
      {
        onError: (error) => toast.error((error as Error).message || 'Could not save feedback'),
      },
    )
  }

  const counts = data
    ? { helpful: data.helpful, notHelpful: data.notHelpful }
    : { helpful: 0, notHelpful: 0 }

  return (
    <div className="mt-12 border-t border-border/40 pt-6">
      <p className="text-[12px] font-medium text-foreground mb-3">Was this page helpful?</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || mutation.isPending}
          onClick={() => vote(true)}
          className={cn(
            'gap-1.5 text-[12px]',
            data?.myVote?.helpful && 'border-primary/50 bg-primary/10 text-primary'
          )}
        >
          <ThumbsUp className="size-3.5" />
          Yes
          {counts.helpful > 0 && <span className="text-[11px] opacity-70">{counts.helpful}</span>}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || mutation.isPending}
          onClick={() => vote(false)}
          className={cn(
            'gap-1.5 text-[12px]',
            data?.myVote?.helpful === false && 'border-primary/50 bg-primary/10 text-primary'
          )}
        >
          <ThumbsDown className="size-3.5" />
          No
          {counts.notHelpful > 0 && <span className="text-[11px] opacity-70">{counts.notHelpful}</span>}
        </Button>
        {data?.myVote && (
          <span className="text-[11px] text-muted-foreground">Thanks for your feedback!</span>
        )}
      </div>
    </div>
  )
}
