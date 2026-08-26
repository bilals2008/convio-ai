import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, FlaskConical, Plus, RotateCcw, Square } from 'lucide-react'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { usePlaygroundChat } from '@/lib/hooks/use-playground-chat'
import { AiResponse } from '@/components/shared/ai-response'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  {
    label: 'Explain a concept',
    prompt: 'Explain how RAG (retrieval-augmented generation) works in simple terms.',
  },
  {
    label: 'Write markdown',
    prompt: 'Write a short product update with a heading, bullet list, and a table.',
  },
  {
    label: 'Draft a reply',
    prompt: 'Draft a friendly support reply to a customer asking about a refund.',
  },
]

function ModelSelect({
  models,
  value,
  onValueChange,
}: {
  models: { id: string; name: string }[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      items={models.map((m) => ({ label: m.name, value: m.id }))}
      value={value}
      onValueChange={(next) => {
        if (typeof next === 'string') onValueChange(next)
      }}
    >
      <SelectTrigger aria-label="Model" className="bg-background" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function PlaygroundPage() {
  const { data: models = [], isLoading: modelsLoading } = useAvailableModels()
  const [model, setModel] = useState('')
  const { messages, status, error, send, stop, reset } = usePlaygroundChat()

  const resolvedModel =
    models.some((m) => m.id === model) ? model : (models[0]?.id ?? '')

  const isStreaming = status === 'streaming'

  useEffect(() => {
    if (!model && models.length > 0) setModel(models[0].id)
  }, [models, model])

  const suggestions = useMemo(() => SUGGESTIONS, [])

  const handleSubmit = (text: string) => {
    if (!resolvedModel) return
    void send(text, { model: resolvedModel, systemPrompt: 'You are a helpful assistant.' })
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Playground</h1>
          <span className="text-sm text-muted-foreground">Test your agents and models</span>
        </div>
        <Button variant="outline" size="sm" onClick={reset} disabled={messages.length === 0}>
          <Plus data-icon="inline-start" />
          New chat
        </Button>
      </div>

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>What can I help with?</EmptyTitle>
              <EmptyDescription>
                Pick a model and start chatting. Responses stream live from your configured
                providers.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    disabled={!resolvedModel || modelsLoading}
                    onClick={() => handleSubmit(s.prompt)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
                {messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-1">
                        {message.content ? (
                          <AiResponse content={message.content} showActions={false} />
                        ) : (
                          <span className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                            <Spinner className="size-3.5" /> Thinking…
                          </span>
                        )}
                      </div>
                    )}
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 pb-2">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <RotateCcw className="size-3.5 shrink-0" />
            {error}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const input = event.currentTarget.elements.namedItem('prompt') as HTMLTextAreaElement
            const text = input.value.trim()
            if (!text || isStreaming) return
            handleSubmit(text)
            input.value = ''
          }}
        >
          <InputGroup>
            <InputGroupTextarea
              name="prompt"
              placeholder={resolvedModel ? 'Send a message…' : modelsLoading ? 'Loading models…' : 'No models available — add a provider key first'}
              className="p-3.5"
              disabled={!resolvedModel}
            />
            <InputGroupAddon align="block-end">
              <ModelSelect models={models} value={resolvedModel} onValueChange={setModel} />
              {isStreaming ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Stop generating"
                  className="ml-auto"
                  onClick={stop}
                >
                  <Square />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  aria-label="Send message"
                  className={cn('ml-auto')}
                  disabled={!resolvedModel || modelsLoading}
                >
                  <ArrowUp />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  )
}
