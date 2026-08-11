export const STATUS_META: Record<string, { label: string; variant: string }> = {
  open: { label: 'Open', variant: 'pending' },
  in_progress: { label: 'In progress', variant: 'active' },
  resolved: { label: 'Resolved', variant: 'resolved' },
  closed: { label: 'Closed', variant: 'closed' },
}