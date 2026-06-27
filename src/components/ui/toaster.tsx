import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

const VARIANT_ICON: Record<string, React.ReactElement> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />,
  destructive: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
  default: <Info className="h-5 w-5 text-primary shrink-0" />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = VARIANT_ICON[variant ?? "default"] ?? VARIANT_ICON.default
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 min-w-0">
              {icon}
              <div className="grid gap-0.5 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
