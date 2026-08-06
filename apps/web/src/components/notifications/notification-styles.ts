import {
  Rocket,
  Building2,
  Brain,
  MessageSquare,
  BookOpen,
  Cable,
  CreditCard,
  BarChart3,
  ShieldAlert,
  User,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_META: Record<string, { icon: LucideIcon; label: string }> = {
  system: { icon: Rocket, label: 'System' },
  organization: { icon: Building2, label: 'Organization' },
  agent: { icon: Brain, label: 'Agent' },
  conversation: { icon: MessageSquare, label: 'Conversations' },
  knowledge: { icon: BookOpen, label: 'Knowledge' },
  integration: { icon: Cable, label: 'Integrations' },
  billing: { icon: CreditCard, label: 'Billing' },
  analytics: { icon: BarChart3, label: 'Analytics' },
  security: { icon: ShieldAlert, label: 'Security' },
  user: { icon: User, label: 'Account' },
}

export const CATEGORIES = Object.keys(CATEGORY_META)

export const PRIORITY_META: Record<string, { label: string; badge: string; dot: string }> = {
  critical: { label: 'Critical', badge: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  high: { label: 'High', badge: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  medium: { label: 'Medium', badge: 'bg-info/10 text-info border-info/20', dot: 'bg-info' },
  low: { label: 'Low', badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  info: { label: 'Info', badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
}

export const PRIORITIES = Object.keys(PRIORITY_META)

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_META[category]?.icon ?? Rocket
}

export const NOTIFICATION_STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
]

export interface NotificationFilters {
  status: string
  category: string
  priority: string
  search: string
}

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  status: 'all',
  category: 'all',
  priority: 'all',
  search: '',
}