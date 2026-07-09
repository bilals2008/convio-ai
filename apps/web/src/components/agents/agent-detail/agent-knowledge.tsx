import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'

interface AgentKnowledgeProps {
  selected: string[]
  onSelect: (id: string) => void
  disabled?: boolean
}

export function AgentKnowledge({ selected, onSelect, disabled }: AgentKnowledgeProps) {
  return (
    <AgentKnowledgeSources
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
    />
  )
}
