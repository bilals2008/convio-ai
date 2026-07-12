"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const modalSizes = {
  lg: "w-[90vw] h-[90vh]",
  md: "w-[70vw] h-[70vh]",
  sm: "w-[50vw] h-[50vh]",
} as const

type ModalSize = keyof typeof modalSizes

interface ResizableModalProps extends DialogPrimitive.Root.Props {
  size?: ModalSize
}

function ResizableModal({ size = "sm", children, ...props }: ResizableModalProps) {
  return (
    <DialogPrimitive.Root data-slot="resizable-modal" {...props}>
      {typeof children === "function"
        ? (props: Record<string, unknown>) => (
            <ResizableModalContent size={size}>
              {children(props)}
            </ResizableModalContent>
          )
        : children}
    </DialogPrimitive.Root>
  )
}

function ResizableModalTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="resizable-modal-trigger" {...props} />
}

function ResizableModalPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="resizable-modal-portal" {...props} />
}

function ResizableModalOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="resizable-modal-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

interface ResizableModalContentProps extends DialogPrimitive.Popup.Props {
  size?: ModalSize
  showCloseButton?: boolean
}

function ResizableModalContent({
  className,
  children,
  showCloseButton = true,
  size = "sm",
  ...props
}: ResizableModalContentProps) {
  return (
    <ResizableModalPortal>
      <ResizableModalOverlay />
      <DialogPrimitive.Popup
        data-slot="resizable-modal-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none overflow-auto data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          modalSizes[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="resizable-modal-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </ResizableModalPortal>
  )
}

function ResizableModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resizable-modal-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function ResizableModalFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="resizable-modal-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function ResizableModalTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="resizable-modal-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function ResizableModalDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="resizable-modal-description"
      className={cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className)}
      {...props}
    />
  )
}

function ResizableModalClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="resizable-modal-close" {...props} />
}

export {
  ResizableModal,
  ResizableModalTrigger,
  ResizableModalContent,
  ResizableModalOverlay,
  ResizableModalPortal,
  ResizableModalHeader,
  ResizableModalFooter,
  ResizableModalTitle,
  ResizableModalDescription,
  ResizableModalClose,
  type ModalSize,
  modalSizes,
}
