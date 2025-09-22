"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import clsx from "clsx"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }: {
        id: string
        title?: React.ReactNode
        description?: React.ReactNode
        action?: React.ReactNode
        variant?: "default" | "destructive" | "success" | "error" | "warning" | "info" | null | undefined
        [key: string]: any
      }) {
        return (
          <Toast
            key={id}
            {...props}
            className={clsx(
              "border-l-4 shadow-md rounded-lg p-4",
              variant === "success" && "border-green-500 bg-green-50",
              variant === "error" && "border-red-500 bg-red-50",
              variant === "warning" && "border-yellow-500 bg-yellow-50",
              variant === "info" && "border-blue-500 bg-blue-50"
            )}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 z-[9999] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]" />
    </ToastProvider>
  )
}
