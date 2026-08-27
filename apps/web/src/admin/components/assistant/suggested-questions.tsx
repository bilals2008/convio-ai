import { Button } from '@/components/ui/button'

const suggestions = [
  { label: "Today's Revenue", question: 'How much revenue was generated today?' },
  { label: 'User Growth', question: 'How many users signed up this week compared to last week?' },
  { label: 'Active Orgs', question: 'How many organizations are active and which are the most active?' },
  { label: 'Agent Performance', question: 'Which agents have the highest conversation counts?' },
  { label: 'Open Tickets', question: 'How many tickets are open right now?' },
  { label: 'System Health', question: 'Give me a system health summary.' },
]

interface SuggestedQuestionsProps {
  onSend: (question: string) => void
}

export function SuggestedQuestions({ onSend }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((s) => (
        <Button
          key={s.label}
          variant="outline"
          size="sm"
          onClick={() => onSend(s.question)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  )
}
