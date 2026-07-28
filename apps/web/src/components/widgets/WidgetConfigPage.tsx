import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Layout, Palette, Star } from 'lucide-react'
import { ChatWidget } from '@/components/widget'
import { PageContainer } from '@/components/shared/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { TemplateTab } from './components/TemplateTab'
import { isLightColor } from './helpers'

export default function WidgetConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(true)

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
    copied,
    activeTab,
    setActiveTab,
    activeTemplate,
    setActiveTemplate,
    applyTemplate,
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
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[400px] rounded-xl" />
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="appearance">
            <Palette className="size-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="size-4" />
            Layout
          </TabsTrigger>
           <TabsTrigger value="templates">
             <Star className="size-4" />
             Templates
           </TabsTrigger>
           <TabsTrigger value="install">
             <Code2 className="size-4" />
             Install
           </TabsTrigger>
        </TabsList>

        <div className="space-y-5">
          <TabsContent value="appearance">
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
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
            />
          </TabsContent>

          <TabsContent value="layout">
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
          </TabsContent>

           <TabsContent value="templates">
             <TemplateTab
               activeTemplate={activeTemplate}
               onSelectTemplate={applyTemplate}
             />
           </TabsContent>

           <TabsContent value="install">
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
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete widget</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{widget.name}&rdquo; and its embed configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWidget.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteWidget.isPending}
              onClick={handleDelete}
            >
              {deleteWidget.isPending ? 'Deleting...' : 'Delete widget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {widget.agent.id && showPreview && (
        <ChatWidget
          key={`${agentName}-${primaryColor}-${backgroundColor}-${textColor}-${position}-${widget.config.greeting}-${agentAvatar}-${themeMode}`}
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
          preview
          theme={{
            primaryColor,
            backgroundColor,
            textColor: previewTextColor,
            promptBgColor,
            headerGradientStart,
            headerGradientEnd,
            headerGradientDirection,
            borderColor,
            inputBgColor,
            sendBtnColor,
          }}
        />
      )}
    </PageContainer>
  )
}
