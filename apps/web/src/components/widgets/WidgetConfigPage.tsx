import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, MessageSquare, Palette } from 'lucide-react'
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
import { ContentTab } from './components/ContentTab'
import { AppearanceTab } from './components/AppearanceTab'
import { InstallTab } from './components/InstallTab'
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
    greeting,
    setGreeting,
    prompts,
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
    addPrompt,
    updatePrompt,
    removePrompt,
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
      <PageContainer className="space-y-8">
        <div className="space-y-6 border-b border-border/60 pb-6">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-[420px] rounded-xl" />
          </div>
          <Skeleton className="h-[460px] rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  const previewTextColor = isLightColor(backgroundColor) ? '#1f2937' : textColor

  return (
    <PageContainer className="space-y-8">
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

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="content">
              <MessageSquare className="size-4" aria-hidden="true" />
              Content
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="size-4" aria-hidden="true" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="install">
              <Code2 className="size-4" aria-hidden="true" />
              Install
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <ContentTab
              greeting={greeting}
              onGreetingChange={setGreeting}
              prompts={prompts}
              onAddPrompt={addPrompt}
              onUpdatePrompt={updatePrompt}
              onRemovePrompt={removePrompt}
            />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
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
              position={position}
              onPositionChange={setPosition}
            />
          </TabsContent>

          <TabsContent value="install" className="space-y-6">
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
        </Tabs>

        <WidgetPreview
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          position={position}
          greeting={greeting}
          prompts={prompts}
          agentName={agentName}
          agentAvatar={agentAvatar}
          publicKey={widget.publicKey}
        />
      </div>

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
              {deleteWidget.isPending ? 'Deleting' : 'Delete widget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {widget.agent.id && (
        <ChatWidget
          key={`${agentName}-${primaryColor}-${backgroundColor}-${textColor}-${position}-${greeting}-${agentAvatar}-${prompts.map((p) => p.text).join(',')}`}
          agentId={widget.agent.id}
          position={position}
          greeting={greeting || 'Hi there! How can I help you today?'}
          agentName={agentName || widget.agent.name}
          agentAvatar={agentAvatar || undefined}
          quickReplies={prompts.map((p) => p.text).filter(Boolean)}
          theme={{
            primaryColor,
            backgroundColor,
            textColor: previewTextColor,
          }}
        />
      )}
    </PageContainer>
  )
}
