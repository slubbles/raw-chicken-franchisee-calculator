"use client"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number // 0-100
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  label?: string
  className?: string
}

export function Progress({
  value,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const variants = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
  }

  // Auto-determine variant based on value if default
  let barVariant = variant
  if (variant === "default") {
    if (clampedValue >= 90) barVariant = "danger"
    else if (clampedValue >= 75) barVariant = "warning"
    else barVariant = "success"
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-sm font-medium text-white">{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-gray-800 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variants[barVariant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
