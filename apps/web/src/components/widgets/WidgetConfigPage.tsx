import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Code2, Layout, Monitor, Palette, Smartphone, Wand2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { WidgetHeader } from '@/components/widgets/components/WidgetHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useWidgetForm } from './hooks/useWidgetForm'
import { AppearanceTab } from './components/AppearanceTab'
import { InstallTab } from './components/InstallTab'
import { LayoutTab } from './components/LayoutTab'
import { DesignAiTab } from './components/DesignAiTab'
import { WidgetPreviewPanel } from './components/WidgetPreviewPanel'
import { cn } from '@/lib/utils'

const TAB_ITEMS = [
  { value: 'appearance', label: 'Appearance', icon: Palette },
  { value: 'layout', label: 'Layout', icon: Layout },
  { value: 'design', label: 'Design AI', icon: Wand2 },
  { value: 'install', label: 'Install', icon: Code2 },
] as const

function LoadingSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
        <div className="hidden w-[380px] shrink-0 xl:block">
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    </PageContainer>
  )
}

function NotFoundState({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <p className="text-sm font-medium">Widget not found</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          This widget was deleted, or the link is no longer valid.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
          <Button size="sm" onClick={onBack}>
            Back to widgets
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default function WidgetConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [discardOpen, setDiscardOpen] = useState(false)

  const {
    widget,
    isLoading,
    isError,
    refetch,
    name,
    domainInput,
    setDomainInput,
    domains,
    addDomain,
    removeDomain,
    config,
    setConfig,
    copied,
    activeTab,
    setActiveTab,
    applyAiDraft,
    deleteOpen,
    setDeleteOpen,
    isDirty,
    save,
    deleteWidget,
    copyEmbed,
    embedSnippet,
  } = useWidgetForm(id)

  const leave = useCallback(() => navigate('/widgets'), [navigate])

  // In-app navigation isn't covered by the beforeunload guard, so unsaved
  // changes get an explicit confirmation instead of being silently dropped.
  const handleBack = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    leave()
  }, [isDirty, leave])

  const handleSave = useCallback((status?: string) => save.mutate(status), [save])
  const handleDelete = useCallback(() => deleteWidget.mutate(), [deleteWidget])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 's') return
      if (!isDirty || save.isPending) return
      e.preventDefault()
      save.mutate(undefined)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDirty, save])

  if (isLoading) return <LoadingSkeleton />

  if (isError || !widget) {
    return <NotFoundState onRetry={() => refetch()} onBack={leave} />
  }

  const canPublish = domains.length > 0

  return (
    <PageContainer>
      <WidgetHeader
        widget={widget}
        name={name}
        isDirty={isDirty}
        copied={copied}
        canPublish={canPublish}
        position={config.position ?? 'bottom-right'}
        savePending={save.isPending}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((v) => !v)}
        onSave={handleSave}
        onCopyEmbed={copyEmbed}
        onDeleteOpen={() => setDeleteOpen(true)}
        onBack={handleBack}
      />

      <div className="mt-6 flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div
            role="tablist"
            aria-label="Widget settings"
            className="mb-5 inline-flex w-full max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-muted/30 p-1 sm:w-auto"
          >
            {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`widget-tab-${value}`}
                aria-selected={activeTab === value}
                aria-controls="widget-tabpanel"
                onClick={() => setActiveTab(value)}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11px] font-medium transition-all sm:flex-none sm:px-3.5 sm:text-xs',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  activeTab === value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/50',
                )}
              >
                <Icon className="size-3 shrink-0 sm:size-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id="widget-tabpanel"
            aria-labelledby={`widget-tab-${activeTab}`}
            tabIndex={-1}
            className="focus-visible:outline-none"
          >
            {activeTab === 'appearance' && <AppearanceTab config={config} onChange={setConfig} />}

            {activeTab === 'layout' && <LayoutTab config={config} onChange={setConfig} />}

            {activeTab === 'design' && (
              <DesignAiTab onApplyAiDraft={applyAiDraft} disabled={save.isPending} />
            )}

            {activeTab === 'install' && (
              <InstallTab
                domains={domains}
                domainInput={domainInput}
                onDomainInputChange={setDomainInput}
                onAddDomain={addDomain}
                onRemoveDomain={removeDomain}
                publicKey={widget.publicKey}
                position={config.position ?? 'bottom-right'}
                snippet={embedSnippet ?? ''}
              />
            )}
          </div>
        </div>

        {/* Preview panel — renders the real widget, contained in a device frame */}
        {showPreview && (
          <aside className="hidden w-[380px] shrink-0 xl:block">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Live preview</span>
                <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    aria-pressed={previewDevice === 'desktop'}
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-md transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      previewDevice === 'desktop'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Desktop preview"
                  >
                    <Monitor className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    aria-pressed={previewDevice === 'mobile'}
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-md transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      previewDevice === 'mobile'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Mobile preview"
                  >
                    <Smartphone className="size-3.5" />
                  </button>
                </div>
              </div>

              <WidgetPreviewPanel widget={widget} config={config} device={previewDevice} />

              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/60">
                This is the real widget — chat with your agent, or close it to check the launcher.
              </p>
            </div>
          </aside>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete widget</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete &ldquo;{name}&rdquo; and its embed configuration. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWidget.isPending} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteWidget.isPending}
              onClick={handleDelete}
              className="h-8 text-xs"
            >
              {deleteWidget.isPending ? 'Deleting...' : 'Delete widget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Your changes to &ldquo;{name}&rdquo; haven&rsquo;t been saved yet. Leaving now will
              discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={leave}
              className="h-8 text-xs"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
