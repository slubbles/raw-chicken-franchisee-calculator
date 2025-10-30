"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose }, ref) => {
    const variants = {
      default: "bg-gray-900 border-gray-700",
      success: "bg-green-950 border-green-700",
      error: "bg-red-950 border-red-700",
      warning: "bg-yellow-950 border-yellow-700",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-full",
          variants[variant]
        )}
      >
        <div className="flex gap-3">
          <div className="flex-1">
            {title && (
              <div className="text-sm font-semibold text-white">{title}</div>
            )}
            {description && (
              <div className="mt-1 text-sm text-gray-300">{description}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
