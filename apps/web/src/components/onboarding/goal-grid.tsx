import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, MessageSquare, MessageCircle, BookOpen, LayoutDashboard } from 'lucide-react'
import { GoalCard } from './goal-card'
import { useSetOnboardingGoal } from '@/lib/hooks/use-onboarding'
import type { OnboardingGoal } from '@convio/types'

const GOALS: { id: OnboardingGoal; icon: typeof Bot; title: string; description: string; route: string }[] = [
  { id: 'create_agent', icon: Bot, title: 'Create my first AI Agent', description: 'Start with a pre-built template and customize as you go.', route: '/agents/new?onboarding=true' },
  { id: 'create_chatbot', icon: MessageSquare, title: 'Build a Chatbot', description: 'Create an agent with a web widget ready to embed.', route: '/agents/new?onboarding=chatbot' },
  { id: 'connect_whatsapp', icon: MessageCircle, title: 'Connect WhatsApp', description: 'Deploy your agent to WhatsApp for live conversations.', route: '/settings/deployments?onboarding=whatsapp' },
  { id: 'upload_kb', icon: BookOpen, title: 'Upload a Knowledge Base', description: 'Give your agent documents to answer from.', route: '/knowledge?onboarding=true' },
  { id: 'explore', icon: LayoutDashboard, title: 'Just explore the dashboard', description: 'Take a look around — help is always available.', route: '/dashboard' },
]

interface GoalGridProps {
  onSkip: () => void
}

export function GoalGrid({ onSkip }: GoalGridProps) {
  const [selected, setSelected] = useState<OnboardingGoal | null>(null)
  const navigate = useNavigate()
  const { mutate, isPending } = useSetOnboardingGoal()

  function handleSelect(goal: OnboardingGoal, route: string) {
    setSelected(goal)
    mutate(goal, {
      onSuccess: () => {
        navigate(route)
      },
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            icon={goal.icon}
            title={goal.title}
            description={goal.description}
            selected={selected === goal.id}
            onSelect={() => handleSelect(goal.id, goal.route)}
          />
        ))}
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onSkip}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip →
        </button>
      </div>
    </div>
  )
}
