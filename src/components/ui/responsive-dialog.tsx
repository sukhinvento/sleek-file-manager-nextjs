import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

interface ResponsiveDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function ResponsiveDialogContent({
  children,
  className,
  showCloseButton = true,
  ...props
}: ResponsiveDialogContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent 
        className={cn(
          "max-h-[96vh] flex flex-col p-0 rounded-t-[24px] bg-background border border-border",
          className
        )}
        {...props}
      >
        {/* Custom drag handle */}
        <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-muted" />
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent 
      className={cn(
        "w-[95vw] !max-w-[500px] sm:w-full !overflow-hidden !rounded-3xl rounded-3xl !border-0 p-0",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

interface ResponsiveDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialogHeader({
  children,
  className,
  ...props
}: ResponsiveDialogHeaderProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerHeader 
        className={cn(
          "bg-[#1a202c] px-6 py-6 rounded-t-[24px] border-b border-gray-700 flex-shrink-0 text-left p-0 pt-0",
          className
        )}
        {...props}
      >
        <div className="px-6 py-6">
          {children}
        </div>
      </DrawerHeader>
    )
  }

  return (
    <DialogHeader 
      className={cn(
        "bg-[#1a202c] px-6 py-7 !rounded-t-3xl rounded-t-3xl border-b border-gray-700 flex-shrink-0 min-h-[64px] text-left",
        className
      )}
      {...props}
    >
      {children}
    </DialogHeader>
  )
}

interface ResponsiveDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialogTitle({
  children,
  className,
  ...props
}: ResponsiveDialogTitleProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerTitle 
        className={cn("flex items-center gap-2 text-white", className)}
        {...props}
      >
        {children}
      </DrawerTitle>
    )
  }

  return (
    <DialogTitle 
      className={cn("flex items-center gap-2 text-white", className)}
      {...props}
    >
      {children}
    </DialogTitle>
  )
}

interface ResponsiveDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialogDescription({
  children,
  className,
  ...props
}: ResponsiveDialogDescriptionProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerDescription 
        className={cn("text-gray-400", className)}
        {...props}
      >
        {children}
      </DrawerDescription>
    )
  }

  return (
    <DialogDescription 
      className={cn("text-gray-400", className)}
      {...props}
    >
      {children}
    </DialogDescription>
  )
}

interface ResponsiveDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialogFooter({
  children,
  className,
  ...props
}: ResponsiveDialogFooterProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerFooter 
        className={cn(
          "px-6 py-4 border-t flex-shrink-0 bg-gray-50 flex flex-row gap-2",
          className
        )}
        {...props}
      >
        {children}
      </DrawerFooter>
    )
  }

  return (
    <DialogFooter 
      className={cn(
        "px-6 py-4 border-t flex-shrink-0 bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </DialogFooter>
  )
}

interface ResponsiveDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialogBody({
  children,
  className,
  ...props
}: ResponsiveDialogBodyProps) {
  const isMobile = useIsMobile()

  return (
    <div 
      className={cn(
        isMobile 
          ? "flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-white"
          : "overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4 custom-scrollbar",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
