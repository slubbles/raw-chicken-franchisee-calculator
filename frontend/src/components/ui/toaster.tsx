"use client"

import * as React from "react"
import { Toast, ToastProps } from "@/components/ui/toast"

interface ToasterProps {
  toasts: ToastProps[]
  removeToast: (id: string) => void
}

export function Toaster({ toasts, removeToast }: ToasterProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Hook for using toasts
let toastId = 0

interface ToastContextType {
  toast: (props: Omit<ToastProps, "id">) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback(
    (props: Omit<ToastProps, "id">) => {
      const id = `toast-${toastId++}`
      const duration = props.duration || 5000

      setToasts((prev) => [...prev, { ...props, id }])

      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  const success = React.useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "success" })
    },
    [toast]
  )

  const error = React.useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "error" })
    },
    [toast]
  )

  const warning = React.useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "warning" })
    },
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
