import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Layout, Palette } from 'lucide-react'
import { ChatWidget } from '@/components/widget'
import { PageContainer } from '@/components/shared/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
import { WidgetPreview } from './components/WidgetPreview'
import { WidgetHeader } from './components/WidgetHeader'
import { isLightColor } from './helpers'

export default function WidgetConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
    borderColor,
    setBorderColor,
    inputBgColor,
    setInputBgColor,
    sendBtnColor,
    setSendBtnColor,
    widgetHeight,
    setWidgetHeight,
    agentName,
    setAgentName,
    agentAvatar,
    setAgentAvatar,
    copied,
    activeTab,
    setActiveTab,
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
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
          <Skeleton className="h-[460px] rounded-xl" />
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
          <TabsTrigger value="install">
            <Code2 className="size-4" />
            Install
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-5">
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
                borderColor={borderColor}
                onBorderColorChange={setBorderColor}
                inputBgColor={inputBgColor}
                onInputBgColorChange={setInputBgColor}
                sendBtnColor={sendBtnColor}
                onSendBtnColorChange={setSendBtnColor}
              />
            </TabsContent>

            <TabsContent value="layout">
              <LayoutTab
                position={position}
                onPositionChange={setPosition}
                widgetHeight={widgetHeight}
                onWidgetHeightChange={setWidgetHeight}
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

          <WidgetPreview
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            promptBgColor={promptBgColor}
            headerGradientStart={headerGradientStart}
            headerGradientEnd={headerGradientEnd}
            headerGradientDirection={headerGradientDirection}
            borderColor={borderColor}
            inputBgColor={inputBgColor}
            sendBtnColor={sendBtnColor}
            position={position}
            greeting={widget.config.greeting || 'Hi'}
            agentName={agentName}
            agentAvatar={agentAvatar}
            publicKey={widget.publicKey}
            widgetHeight={widgetHeight}
          />
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

      {widget.agent.id && (
        <ChatWidget
          key={`${agentName}-${primaryColor}-${backgroundColor}-${textColor}-${position}-${widget.config.greeting}-${agentAvatar}`}
          agentId={widget.agent.id}
          position={position}
          greeting={widget.config.greeting || 'Hi'}
          agentName={agentName || widget.agent.name}
          agentAvatar={agentAvatar || undefined}
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
