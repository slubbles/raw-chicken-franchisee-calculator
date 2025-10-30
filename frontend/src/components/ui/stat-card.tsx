"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variants = {
    default: "border-gray-800",
    success: "border-green-700 bg-green-950/20",
    warning: "border-yellow-700 bg-yellow-950/20",
    danger: "border-red-700 bg-red-950/20",
  }

  const iconVariants = {
    default: "text-gray-400",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-black p-6 transition-all hover:shadow-lg",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={cn(
              "mt-1 text-sm",
              trend.value >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg bg-gray-900 p-3", iconVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
