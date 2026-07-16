import { useWidgetState } from './WidgetState'
import { Zap } from 'lucide-react'

const defaultQuickReplies = [
  'What can you help with?',
  'How does this work?',
  'Tell me about Convio',
  'Get started',
]

export function WidgetWelcome() {
  const { agentName, agentAvatar, messages, onSendMessage, quickReplies } = useWidgetState()

  if (messages.length > 0) return null

  const replies = quickReplies.length > 0 ? quickReplies : defaultQuickReplies

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  return (
    <div className="convio-welcome flex flex-1 flex-col items-center justify-center px-5 py-6">
      <div className="flex flex-col items-center text-center w-full max-w-[280px]">
        <div className="relative mb-4">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              className="size-16 rounded-full object-cover ring-4 ring-[hsl(var(--widget-primary)_/_0.1)]"
            />
          ) : (
            <div
              className="size-16 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 80%, black))`,
              }}
            >
              <span className="text-xl font-bold text-white">
                {initials}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-[hsl(var(--widget-bg))] flex items-center justify-center">
            <Zap className="size-2.5 text-white" />
          </div>
        </div>

        <h3 className="text-[15px] font-semibold text-[hsl(var(--widget-text))] mb-1 tracking-tight">
          {agentName || 'Assistant'}
        </h3>
        <p className="text-[12px] text-[hsl(var(--widget-muted-foreground))] mb-5 leading-relaxed px-2">
          Hi there! How can I help you today?
        </p>

        <div className="flex flex-col gap-2 w-full">
          {replies.slice(0, 4).map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSendMessage(reply)}
              className="w-full rounded-xl border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-muted))] px-4 py-2.5 text-[12px] font-medium text-[hsl(var(--widget-text))] hover:border-[hsl(var(--widget-primary)_/_0.4)] hover:bg-[hsl(var(--widget-primary)_/_0.05)] transition-all duration-150 text-left"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
