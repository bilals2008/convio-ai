import { useState, useMemo } from "react"
import { Search, FileText, MessageSquare, ShoppingCart, GraduationCap, Pen, Code, Bot, Star, Clock, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  icon: React.ReactNode
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "support", label: "Support" },
  { id: "sales", label: "Sales" },
  { id: "education", label: "Education" },
  { id: "creative", label: "Creative" },
  { id: "technical", label: "Technical" },
  { id: "personal", label: "Personal" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recent" },
]

const TEMPLATES: PromptTemplate[] = [
  {
    id: "customer-support",
    title: "Customer Support Agent",
    description: "Handles customer inquiries with patience and clarity",
    category: "support",
    icon: <MessageSquare className="size-4" />,
    prompt: `You are a friendly customer support agent. Your goals are:
- Respond to customer inquiries promptly and accurately
- Maintain a calm and patient tone, even with frustrated customers
- Provide step-by-step solutions when troubleshooting
- Escalate complex issues to human agents when necessary
- Always end with "Is there anything else I can help you with?"`,
  },
  {
    id: "faq-bot",
    title: "FAQ Bot",
    description: "Answers frequently asked questions from your knowledge base",
    category: "support",
    icon: <MessageSquare className="size-4" />,
    prompt: `You are an FAQ assistant. Your role is to:
- Answer common questions based on the provided knowledge base
- Keep responses concise and to the point
- Link to relevant documentation when available
- If you don't know the answer, say so honestly and offer to connect with a human`,
  },
  {
    id: "sales-assistant",
    title: "Sales Assistant",
    description: "Engages leads and drives conversions",
    category: "sales",
    icon: <ShoppingCart className="size-4" />,
    prompt: `You are a proactive sales assistant. Your approach:
- Qualify leads by asking about their needs and budget
- Highlight product benefits that match the customer's requirements
- Handle objections with empathy and facts
- Suggest relevant upsells or complementary products
- Create urgency without being pushy
- Always aim to book a demo or close the sale`,
  },
  {
    id: "lead-qualifier",
    title: "Lead Qualifier",
    description: "Screens and scores incoming leads automatically",
    category: "sales",
    icon: <ShoppingCart className="size-4" />,
    prompt: `You are a lead qualification specialist. Your process:
- Ask qualifying questions to determine lead fit
- Capture key information: company size, budget, timeline, decision-makers
- Score leads as hot/warm/cold based on responses
- Route hot leads immediately to the sales team
- Nurture warm leads with relevant content`,
  },
  {
    id: "tutor",
    title: "Tutor & Educator",
    description: "Teaches concepts with patience and examples",
    category: "education",
    icon: <GraduationCap className="size-4" />,
    prompt: `You are a patient and knowledgeable tutor. Your teaching style:
- Break down complex concepts into simple explanations
- Use analogies and real-world examples
- Ask comprehension-check questions after each topic
- Adapt your explanation style to the student's level
- Encourage questions and create a safe learning environment
- Provide practice exercises with feedback`,
  },
  {
    id: "study-buddy",
    title: "Study Buddy",
    description: "Helps with homework, research, and exam prep",
    category: "education",
    icon: <GraduationCap className="size-4" />,
    prompt: `You are a supportive study companion. You help by:
- Summarizing complex topics into digestible notes
- Creating flashcards and study guides
- Explaining homework problems step-by-step
- Providing practice questions for exam preparation
- Recommending learning resources and study techniques`,
  },
  {
    id: "creative-writer",
    title: "Creative Writer",
    description: "Generates stories, poems, and creative content",
    category: "creative",
    icon: <Pen className="size-4" />,
    prompt: `You are a creative writing assistant. Your capabilities:
- Generate original stories, poems, and scripts
- Help overcome writer's block with prompts and ideas
- Provide constructive feedback on written work
- Suggest improvements for plot, character, and pacing
- Adapt your writing style to any genre or tone requested`,
  },
  {
    id: "content-writer",
    title: "Content Writer",
    description: "Creates blog posts, articles, and marketing copy",
    category: "creative",
    icon: <Pen className="size-4" />,
    prompt: `You are a professional content writer. Your process:
- Research topics thoroughly before writing
- Craft compelling headlines and introductions
- Write in a clear, engaging, and SEO-friendly style
- Structure content with proper headings and transitions
- Include a strong call-to-action when relevant
- Proofread and polish all content before delivery`,
  },
  {
    id: "code-assistant",
    title: "Code Assistant",
    description: "Helps write, review, and debug code",
    category: "technical",
    icon: <Code className="size-4" />,
    prompt: `You are an expert programming assistant. Your guidelines:
- Write clean, well-documented, and efficient code
- Explain the reasoning behind your solutions
- Consider edge cases and error handling
- Follow best practices for the language/framework
- When debugging, walk through the logic step by step
- Provide runnable code examples when possible`,
  },
  {
    id: "tech-support",
    title: "Technical Support",
    description: "Resolves technical issues systematically",
    category: "technical",
    icon: <Code className="size-4" />,
    prompt: `You are a technical support specialist. Your methodology:
- Gather system information and error details first
- Follow a systematic troubleshooting checklist
- Provide clear, copy-paste friendly commands
- Explain what each step does and why
- Document the resolution for future reference
- Escalate hardware or infrastructure issues appropriately`,
  },
  {
    id: "personal-assistant",
    title: "Personal Assistant",
    description: "Manages tasks, schedules, and daily organization",
    category: "personal",
    icon: <Bot className="size-4" />,
    prompt: `You are a reliable personal assistant. Your duties:
- Help organize tasks, priorities, and deadlines
- Manage calendar scheduling and meeting coordination
- Draft emails and professional communications
- Research topics and summarize findings
- Keep track of important dates and follow-ups
- Stay proactive with reminders and suggestions`,
  },
  {
    id: "wellness-coach",
    title: "Wellness Coach",
    description: "Provides motivation and wellness guidance",
    category: "personal",
    icon: <Bot className="size-4" />,
    prompt: `You are a supportive wellness coach. Your approach:
- Help set realistic health and wellness goals
- Provide daily motivation and encouragement
- Suggest healthy habits and routines
- Practice active listening and empathy
- Celebrate wins and help reframe setbacks
- Respect boundaries and know when to recommend professional help`,
  },
]

const FAVORITES_KEY = "convio.template.favorites"
const RECENT_KEY = "convio.template.recent"

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

interface PromptTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (prompt: string) => void
}

export function PromptTemplatesModal({ open, onOpenChange, onSelect }: PromptTemplatesModalProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setFavorites(readJson<string[]>(FAVORITES_KEY, []))
      setRecent(readJson<string[]>(RECENT_KEY, []))
      setSearch("")
      setActiveCategory("all")
      setPreviewId(TEMPLATES[0]?.id ?? null)
    }
    onOpenChange(next)
  }

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      const matchesSearch =
        q === "" ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.prompt.toLowerCase().includes(q)
      const matchesCategory =
        activeCategory === "all"
          ? true
          : activeCategory === "favorites"
            ? favorites.includes(t.id)
            : activeCategory === "recent"
              ? recent.includes(t.id)
              : t.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory, favorites, recent])

  const orderedTemplates = useMemo(() => {
    if (activeCategory === "recent" && recent.length) {
      const byId = new Map(TEMPLATES.map((t) => [t.id, t]))
      const ordered = recent.map((id) => byId.get(id)).filter(Boolean) as PromptTemplate[]
      return [...ordered, ...filteredTemplates.filter((t) => !recent.includes(t.id))]
    }
    return filteredTemplates
  }, [activeCategory, recent, filteredTemplates])

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === previewId) ?? null,
    [previewId]
  )

  const displayTemplate = selectedTemplate ?? orderedTemplates[0] ?? null

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleUse = (template: PromptTemplate) => {
    const nextRecent = [template.id, ...recent.filter((id) => id !== template.id)].slice(0, 6)
    setRecent(nextRecent)
    localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent))
    onSelect(template.prompt)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[88vh] w-[92vw] max-w-4xl grid-cols-1 gap-0 overflow-hidden p-0 md:grid-cols-[1.5fr_1fr]"
      >
        <DialogTitle className="sr-only">System Prompt Templates</DialogTitle>
        <DialogDescription className="sr-only">
          Browse templates, preview them, and apply one to your agent.
        </DialogDescription>

        {/* List pane */}
        <div className="flex min-h-0 flex-col border-border md:border-r">
          <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-popover p-4">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">System Prompt Templates</h2>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id
                const count =
                  cat.id === "favorites"
                    ? favorites.length
                    : cat.id === "recent"
                      ? recent.length
                      : cat.id === "all"
                        ? TEMPLATES.length
                        : TEMPLATES.filter((t) => t.category === cat.id).length
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                       "inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary/30 bg-primary/10 text-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat.id === "favorites" && <Star className="size-3" />}
                    {cat.id === "recent" && <Clock className="size-3" />}
                    {cat.label}
                    <span className="text-[10px] opacity-60">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 p-3">
              {orderedTemplates.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <FileText className="size-6 text-muted-foreground" />
                  <p className="text-sm font-medium">No templates found</p>
                  <p className="max-w-[240px] text-xs text-muted-foreground">
                    Try a different search or category filter.
                  </p>
                </div>
              ) : (
                orderedTemplates.map((template) => {
                  const isPreview = previewId === template.id
                  const isFav = favorites.includes(template.id)
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setPreviewId(template.id)}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
                        isPreview ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "bg-card"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isPreview ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        {template.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{template.title}</span>
                          {isFav && <Star className="size-3 shrink-0 fill-primary text-primary" />}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {template.description}
                        </p>
                        <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-muted-foreground/70">
                          {template.prompt}
                        </p>
                      </div>
                      <Badge variant="outline" className="hidden shrink-0 text-[10px] capitalize sm:inline-flex">
                        {template.category}
                      </Badge>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Preview pane */}
        <div className="hidden min-h-0 flex-col bg-muted/30 md:flex">
          {displayTemplate ? (
            <>
              <div className="flex items-start gap-3 border-b border-border p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {displayTemplate.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{displayTemplate.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{displayTemplate.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => toggleFavorite(displayTemplate.id)}
                  aria-label={favorites.includes(displayTemplate.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={cn(
                      "size-4",
                      favorites.includes(displayTemplate.id) ? "fill-primary text-primary" : "text-muted-foreground"
                    )}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <span className="text-lg leading-none">×</span>
                </Button>
              </div>

              <ScrollArea className="min-h-0 flex-1 p-4">
                <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {displayTemplate.prompt}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  This prompt will be applied to your agent’s system instructions. You can edit it afterward.
                </p>
              </ScrollArea>

              <div className="border-t border-border p-4">
                <Button
                  type="button"
                  className="w-full gap-1.5"
                  onClick={() => handleUse(displayTemplate)}
                >
                  Use this template
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <FileText className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Select a template</p>
              <p className="max-w-[220px] text-xs text-muted-foreground">
                Choose a template on the left to preview it here.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
