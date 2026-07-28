import { useWidgetState } from './WidgetState'
import { Zap } from 'lucide-react'

const defaultQuickReplies = [
  'What can you help with?',
  'How does this work?',
  'Tell me about Convio',
  'Get started',
]

const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  chat: '💬',
  help: '❓',
  sale: '💰',
  doc: '📚',
  order: '📦',
  support: '🛟',
  star: '⭐',
  email: '✉️',
  setting: '⚙️',
}

export function WidgetWelcome() {
  const { agentName, agentAvatar, messages, onSendMessage, quickReplies, homeMenu, headerSubtitle } = useWidgetState()

  if (messages.length > 0) return null

  const replies = quickReplies.length > 0 ? quickReplies : defaultQuickReplies

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  return (
    <div className="convio-welcome flex flex-1 flex-col items-center justify-center px-5 py-6 bg-[hsl(var(--widget-bg))]">
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
                background: `linear-gradient(135deg, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))`,
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
          {headerSubtitle || "Hi there! How can I help you today?"}
        </p>

        {homeMenu.length > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            {homeMenu.slice(0, 6).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSendMessage(item.label)}
                className="flex items-center gap-3 w-full rounded-xl border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-muted))] px-4 py-3 text-left hover:border-[hsl(var(--widget-primary)_/_0.4)] hover:bg-[hsl(var(--widget-primary)_/_0.05)] transition-all duration-150"
              >
                <span className="text-lg shrink-0">{ICON_MAP[item.icon] || '💬'}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[hsl(var(--widget-text))] leading-tight">{item.label}</p>
                  {item.description && (
                    <p className="text-[11px] text-[hsl(var(--widget-muted-foreground))] mt-0.5 leading-tight">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {replies.slice(0, 4).map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => onSendMessage(reply)}
                className="rounded-full border border-[hsl(var(--widget-primary)_/_0.3)] bg-[hsl(var(--widget-primary)_/_0.06)] px-4 py-2 text-[12px] font-medium text-[hsl(var(--widget-primary))] hover:bg-[hsl(var(--widget-primary)_/_0.12)] hover:border-[hsl(var(--widget-primary)_/_0.5)] transition-all duration-150"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
