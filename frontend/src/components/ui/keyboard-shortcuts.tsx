"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./toaster"

export function KeyboardShortcuts() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Check for specific key combinations
      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/orders/new")
        toast({
          title: "Quick Navigation",
          description: "Opening New Order form",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "d" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/dashboard")
        toast({
          title: "Quick Navigation",
          description: "Opening Dashboard",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "o" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/orders")
        toast({
          title: "Quick Navigation",
          description: "Opening Orders",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "b" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/budgets")
        toast({
          title: "Quick Navigation",
          description: "Opening Budgets",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/supplies")
        toast({
          title: "Quick Navigation",
          description: "Opening Supplies",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "h" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push("/")
        toast({
          title: "Quick Navigation",
          description: "Opening Home",
          variant: "default",
          duration: 2000,
        })
      } else if (e.key === "?" && e.shiftKey) {
        e.preventDefault()
        showShortcutsHelp()
      }
    }

    const showShortcutsHelp = () => {
      toast({
        title: "⌨️ Keyboard Shortcuts",
        description: "H: Home | N: New Order | O: Orders | B: Budgets | D: Dashboard | S: Supplies",
        duration: 8000,
      })
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router, toast])

  return null
}
