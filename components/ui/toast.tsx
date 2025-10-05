"use client"

import { useEffect, useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
  show: boolean
}

export default function Toast({ message, type = "info", duration = 3000, onClose, show }: ToastProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: Check,
    error: X,
    info: AlertCircle,
  }

  const Icon = icons[type]

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div
        className={cn("flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm", {
          "bg-green-50 text-green-800 border border-green-200": type === "success",
          "bg-red-50 text-red-800 border border-red-200": type === "error",
          "bg-blue-50 text-blue-800 border border-blue-200": type === "info",
        })}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="ml-auto flex-shrink-0 hover:opacity-70"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
