import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Layout, Palette, Wand2 } from 'lucide-react'
import { ChatWidget } from '@/components/widget'
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
  const [previewThemeMode, setPreviewThemeMode] = useState<'auto' | 'light' | 'dark'>('auto')

  const {
    widget,
    isLoading,
    name,
    domainInput,
    setDomainInput,
    position,
    setPosition,
    primaryColor,
    setPrimaryColor,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    promptBgColor,
    setPromptBgColor,
    headerGradientStart,
    setHeaderGradientStart,
    headerGradientEnd,
    setHeaderGradientEnd,
    headerGradientDirection,
    setHeaderGradientDirection,
    headerGradient,
    setHeaderGradient,
    borderColor,
    setBorderColor,
    inputBgColor,
    setInputBgColor,
    sendBtnColor,
    setSendBtnColor,
    footerBgColor,
    setFooterBgColor,
    widgetHeight,
    setWidgetHeight,
    widgetWidth,
    setWidgetWidth,
    launcherSize,
    setLauncherSize,
    borderRadius,
    setBorderRadius,
    agentName,
    setAgentName,
    agentAvatar,
    setAgentAvatar,
    themeMode,
    setThemeMode,
    headerTitle,
    setHeaderTitle,
    headerSubtitle,
    setHeaderSubtitle,
    showOnlineIndicator,
    setShowOnlineIndicator,
    launcherLabel,
    setLauncherLabel,
    placeholderText,
    setPlaceholderText,
    showPoweredBy,
    setShowPoweredBy,
    quickReplies,
    setQuickReplies,
    copied,
    activeTab,
    setActiveTab,
    applyAiDraft,
    deleteOpen,
    setDeleteOpen,
    isDirty,
    domains,
    save,
    deleteWidget,
    copyEmbed,
    addDomain,
    removeDomain,
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

  const previewTextColor = isLightColor(backgroundColor) ? '#1f2937' : textColor

  return (
    <PageContainer>
      <WidgetHeader
        widget={widget}
        name={name}
        isDirty={isDirty}
        copied={copied}
        position={position}
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
            <nav className="inline-flex items-center gap-0.5 rounded-xl bg-muted/30 p-1">
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
            <AppearanceTab
              agentName={agentName}
              onAgentNameChange={setAgentName}
              agentAvatar={agentAvatar}
              onAgentAvatarChange={setAgentAvatar}
              primaryColor={primaryColor}
              onPrimaryColorChange={setPrimaryColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              textColor={textColor}
              onTextColorChange={setTextColor}
              promptBgColor={promptBgColor}
              onPromptBgColorChange={setPromptBgColor}
              headerGradientStart={headerGradientStart}
              onHeaderGradientStartChange={setHeaderGradientStart}
              headerGradientEnd={headerGradientEnd}
              onHeaderGradientEndChange={setHeaderGradientEnd}
              headerGradientDirection={headerGradientDirection}
              onHeaderGradientDirectionChange={setHeaderGradientDirection}
              headerGradient={headerGradient}
              onHeaderGradientChange={setHeaderGradient}
              borderColor={borderColor}
              onBorderColorChange={setBorderColor}
              inputBgColor={inputBgColor}
              onInputBgColorChange={setInputBgColor}
              sendBtnColor={sendBtnColor}
              onSendBtnColorChange={setSendBtnColor}
              footerBgColor={footerBgColor}
              onFooterBgColorChange={setFooterBgColor}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              headerTitle={headerTitle}
              onHeaderTitleChange={setHeaderTitle}
              headerSubtitle={headerSubtitle}
              onHeaderSubtitleChange={setHeaderSubtitle}
              showOnlineIndicator={showOnlineIndicator}
              onShowOnlineIndicatorChange={setShowOnlineIndicator}
              placeholderText={placeholderText}
              onPlaceholderTextChange={setPlaceholderText}
              showPoweredBy={showPoweredBy}
              onShowPoweredByChange={setShowPoweredBy}
              quickReplies={quickReplies}
              onQuickRepliesChange={setQuickReplies}
              launcherLabel={launcherLabel}
              onLauncherLabelChange={setLauncherLabel}
            />
          )}

          {activeTab === 'layout' && (
            <LayoutTab
              position={position}
              onPositionChange={setPosition}
              widgetHeight={widgetHeight}
              onWidgetHeightChange={setWidgetHeight}
              widgetWidth={widgetWidth}
              onWidgetWidthChange={setWidgetWidth}
              launcherSize={launcherSize}
              onLauncherSizeChange={setLauncherSize}
              borderRadius={borderRadius}
              onBorderRadiusChange={setBorderRadius}
            />
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
              onCopyEmbed={copyEmbed}
              copied={copied}
              position={position}
            />
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="hidden xl:block w-[340px] shrink-0">
            <div className="sticky top-6 rounded-2xl border border-border/40 bg-card/30 overflow-hidden shadow-sm">
              <div
                data-widget-preview
                className={cn(
                  'relative h-[520px]',
                  (previewThemeMode === 'auto' ? themeMode : previewThemeMode) === 'dark' ? 'bg-muted/30' : 'bg-background',
                )}
              >
                <WidgetPreviewPanel
                  primaryColor={primaryColor}
                  backgroundColor={backgroundColor}
                  textColor={previewTextColor}
                  promptBgColor={promptBgColor}
                  headerGradientStart={headerGradientStart}
                  headerGradientEnd={headerGradientEnd}
                  headerGradientDirection={headerGradientDirection}
                  borderColor={borderColor}
                  inputBgColor={inputBgColor}
                  sendBtnColor={sendBtnColor}
                  footerBgColor={footerBgColor}
                  agentName={agentName || widget.agent.name}
                  agentAvatar={agentAvatar || undefined}
                  headerTitle={headerTitle || undefined}
                  headerSubtitle={headerSubtitle || undefined}
                  showOnlineIndicator={showOnlineIndicator}
                  placeholderText={placeholderText || undefined}
                  showPoweredBy={showPoweredBy}
                  quickReplies={quickReplies.length > 0 ? quickReplies : undefined}
                  headerGradient={headerGradient}
                  previewThemeMode={previewThemeMode === 'auto' ? themeMode : previewThemeMode}
                />
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
          key={`${agentName}-${primaryColor}-${backgroundColor}-${textColor}-${position}-${headerTitle}-${headerSubtitle}-${launcherLabel}-${footerBgColor}-${quickReplies.join(',')}`}
          agentId={widget.agent.id}
          position={position}
          greeting={widget.config.greeting || 'Hi'}
          agentName={agentName || widget.agent.name}
          agentAvatar={agentAvatar || undefined}
          themeMode={themeMode}
          widgetWidth={widgetWidth}
          launcherSize={launcherSize}
          borderRadius={borderRadius}
          headerGradient={headerGradient}
          headerTitle={headerTitle || undefined}
          headerSubtitle={headerSubtitle || undefined}
          showOnlineIndicator={showOnlineIndicator}
          launcherLabel={launcherLabel || undefined}
          placeholderText={placeholderText || undefined}
          showPoweredBy={showPoweredBy}
          widgetHeight={widgetHeight}
          quickReplies={quickReplies.length > 0 ? quickReplies : undefined}
          preview
          theme={{
            primaryColor,
            backgroundColor,
            textColor: textColor || '#f3f4f6',
            promptBgColor: promptBgColor || '#2a2a2a',
            headerGradientStart: headerGradientStart || '#1cca4a',
            headerGradientEnd: headerGradientEnd || '#0d7a34',
            headerGradientDirection: `${headerGradientDirection ?? 135}deg`,
            borderColor: borderColor || '',
            inputBgColor: inputBgColor || '',
            sendBtnColor: sendBtnColor || '',
            footerBgColor: footerBgColor || '',
          }}
        />
      )}
    </PageContainer>
  )
}
