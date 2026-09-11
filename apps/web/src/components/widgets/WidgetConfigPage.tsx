import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Layout, Monitor, Smartphone, Palette, Wand2 } from 'lucide-react'
import { ChatWidget, chatWidgetPropsFromConfig } from '@/components/widget'
import { PageContainer } from '@/components/shared/page-container'
import { Skeleton } from '@/components/ui/skeleton'
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
import { isLightColor } from './helpers'
import { cn } from '@/lib/utils'

const TAB_ITEMS = [
  { value: 'appearance', label: 'Appearance', icon: Palette },
  { value: 'layout', label: 'Layout', icon: Layout },
  { value: 'design', label: 'Design AI', icon: Wand2 },
  { value: 'install', label: 'Install', icon: Code2 },
] as const

export default function WidgetConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  const {
    widget,
    isLoading,
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
  } = useWidgetForm(id!)

  const handleBack = useCallback(() => navigate('/widgets'), [navigate])
  const handleSave = useCallback(
    (status?: string) => save.mutate(status),
    [save],
  )
  const handleDeleteOpen = useCallback(() => setDeleteOpen(true), [setDeleteOpen])
  const handleDelete = useCallback(() => deleteWidget.mutate(), [deleteWidget])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && isDirty) {
        e.preventDefault()
        save.mutate()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDirty, save])

  if (isLoading || !widget) {
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
          <div className="hidden xl:block w-[340px] shrink-0">
            <Skeleton className="h-[500px] rounded-xl" />
          </div>
        </div>
      </PageContainer>
    )
  }

  const previewTextColor = isLightColor(config.backgroundColor ?? '') ? '#1f2937' : config.textColor

  return (
    <PageContainer>
      <WidgetHeader
        widget={widget}
        name={name}
        isDirty={isDirty}
        copied={copied}
        position={config.position ?? 'bottom-right'}
        savePending={save.isPending}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((v) => !v)}
        onSave={handleSave}
        onCopyEmbed={copyEmbed}
        onDeleteOpen={handleDeleteOpen}
        onBack={handleBack}
      />

      <div className="mt-6 flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="mb-5">
            <nav className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-muted/30 p-1">
              {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    activeTab === value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'appearance' && (
            <AppearanceTab config={config} onChange={setConfig} />
          )}

          {activeTab === 'layout' && (
            <LayoutTab config={config} onChange={setConfig} />
          )}

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

        {/* Preview panel */}
        {showPreview && (
          <div className="hidden xl:block w-[340px] shrink-0">
            <div className="sticky top-6 space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Preview</span>
                <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-md transition-colors',
                      previewDevice === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Desktop preview"
                  >
                    <Monitor className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-md transition-colors',
                      previewDevice === 'mobile' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Mobile preview"
                  >
                    <Smartphone className="size-3.5" />
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-2xl border border-border/40 bg-card/30 overflow-hidden shadow-sm transition-all',
                  previewDevice === 'mobile' && 'max-w-[280px] mx-auto',
                )}
              >
                <div
                  data-widget-preview
                  className={cn(
                    'relative h-[520px]',
                    config.themeMode === 'dark' ? 'bg-muted/30' : 'bg-background',
                  )}
                >
                  <WidgetPreviewPanel
                    primaryColor={config.primaryColor}
                    backgroundColor={config.backgroundColor}
                    textColor={previewTextColor}
                    promptBgColor={config.promptBgColor}
                    headerGradientStart={config.headerGradientStart}
                    headerGradientEnd={config.headerGradientEnd}
                    headerGradientDirection={config.headerGradientDirection}
                    borderColor={config.borderColor}
                    inputBgColor={config.inputBgColor}
                    sendBtnColor={config.sendBtnColor}
                    footerBgColor={config.footerBgColor}
                    agentName={config.agentName || widget.agent.name}
                    agentAvatar={config.agentAvatar || undefined}
                    headerTitle={config.headerTitle || undefined}
                    headerSubtitle={config.headerSubtitle || undefined}
                    showOnlineIndicator={config.showOnlineIndicator}
                    placeholderText={config.placeholderText || undefined}
                    showPoweredBy={config.showPoweredBy}
                    quickReplies={(config.quickReplies?.length ?? 0) > 0 ? config.quickReplies : undefined}
                    headerGradient={config.headerGradient}
                    previewThemeMode={config.themeMode ?? 'auto'}
                    greeting={config.greeting}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete widget</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete &ldquo;{widget.name}&rdquo; and its embed configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWidget.isPending} className="h-8 text-xs">Cancel</AlertDialogCancel>
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

      {widget && (
        <ChatWidget
          key={JSON.stringify([config.agentName, config.agentAvatar, config.greeting, config.primaryColor, config.backgroundColor, config.textColor, config.position, config.headerTitle, config.headerSubtitle, config.launcherLabel, config.footerBgColor, config.quickReplies, config.widgetWidth, config.widgetHeight, config.launcherSize, config.borderRadius, config.launcherShape, config.customWidth, config.customHeight, config.launcherOffset, config.showTeaser, config.teaserMessage, config.teaserDelay, config.showPoweredBy, config.themeMode, config.headerGradient, config.placeholderText, config.showOnlineIndicator])}
          {...chatWidgetPropsFromConfig(
            { config, agent: widget.agent },
            { agentId: widget.agent.id, publicKey: widget.publicKey, preview: true },
          )}
        />
      )}
    </PageContainer>
  )
}
