import { useState, useMemo } from 'react'
import { Search, FileText, MessageSquare, ShoppingCart, GraduationCap, Pen, Code, Bot, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  icon: React.ReactNode
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'support', label: 'Support' },
  { id: 'sales', label: 'Sales' },
  { id: 'education', label: 'Education' },
  { id: 'creative', label: 'Creative' },
  { id: 'technical', label: 'Technical' },
  { id: 'personal', label: 'Personal' },
]

const TEMPLATES: PromptTemplate[] = [
  {
    id: 'customer-support',
    title: 'Customer Support Agent',
    description: 'Handles customer inquiries with patience and clarity',
    category: 'support',
    icon: <MessageSquare className="size-4" />,
    prompt: `You are a friendly customer support agent. Your goals are:
- Respond to customer inquiries promptly and accurately
- Maintain a calm and patient tone, even with frustrated customers
- Provide step-by-step solutions when troubleshooting
- Escalate complex issues to human agents when necessary
- Always end with "Is there anything else I can help you with?"`,
  },
  {
    id: 'faq-bot',
    title: 'FAQ Bot',
    description: 'Answers frequently asked questions from your knowledge base',
    category: 'support',
    icon: <MessageSquare className="size-4" />,
    prompt: `You are an FAQ assistant. Your role is to:
- Answer common questions based on the provided knowledge base
- Keep responses concise and to the point
- Link to relevant documentation when available
- If you don't know the answer, say so honestly and offer to connect with a human`,
  },
  {
    id: 'sales-assistant',
    title: 'Sales Assistant',
    description: 'Engages leads and drives conversions',
    category: 'sales',
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
    id: 'lead-qualifier',
    title: 'Lead Qualifier',
    description: 'Screens and scores incoming leads automatically',
    category: 'sales',
    icon: <ShoppingCart className="size-4" />,
    prompt: `You are a lead qualification specialist. Your process:
- Ask qualifying questions to determine lead fit
- Capture key information: company size, budget, timeline, decision-makers
- Score leads as hot/warm/cold based on responses
- Route hot leads immediately to the sales team
- Nurture warm leads with relevant content`,
  },
  {
    id: 'tutor',
    title: 'Tutor & Educator',
    description: 'Teaches concepts with patience and examples',
    category: 'education',
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
    id: 'study-buddy',
    title: 'Study Buddy',
    description: 'Helps with homework, research, and exam prep',
    category: 'education',
    icon: <GraduationCap className="size-4" />,
    prompt: `You are a supportive study companion. You help by:
- Summarizing complex topics into digestible notes
- Creating flashcards and study guides
- Explaining homework problems step-by-step
- Providing practice questions for exam preparation
- Recommending learning resources and study techniques`,
  },
  {
    id: 'creative-writer',
    title: 'Creative Writer',
    description: 'Generates stories, poems, and creative content',
    category: 'creative',
    icon: <Pen className="size-4" />,
    prompt: `You are a creative writing assistant. Your capabilities:
- Generate original stories, poems, and scripts
- Help overcome writer's block with prompts and ideas
- Provide constructive feedback on written work
- Suggest improvements for plot, character, and pacing
- Adapt your writing style to any genre or tone requested`,
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    description: 'Creates blog posts, articles, and marketing copy',
    category: 'creative',
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
    id: 'code-assistant',
    title: 'Code Assistant',
    description: 'Helps write, review, and debug code',
    category: 'technical',
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
    id: 'tech-support',
    title: 'Technical Support',
    description: 'Resolves technical issues systematically',
    category: 'technical',
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
    id: 'personal-assistant',
    title: 'Personal Assistant',
    description: 'Manages tasks, schedules, and daily organization',
    category: 'personal',
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
    id: 'wellness-coach',
    title: 'Wellness Coach',
    description: 'Provides motivation and wellness guidance',
    category: 'personal',
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

interface PromptTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (prompt: string) => void
}

export function PromptTemplatesModal({ open, onOpenChange, onSelect }: PromptTemplatesModalProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesSearch = search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.prompt.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            System Prompt Templates
          </DialogTitle>
          <DialogDescription>
            Choose a template to get started quickly. You can customize the prompt after selecting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[400px] -mx-6 px-6">
            <div className="grid gap-3">
              {filteredTemplates.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No templates match your search.
                </div>
              )}
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onSelect(template.prompt)
                    onOpenChange(false)
                  }}
                  className="flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm group"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{template.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed font-mono">
                      {template.prompt.slice(0, 150)}{template.prompt.length > 150 ? '...' : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
