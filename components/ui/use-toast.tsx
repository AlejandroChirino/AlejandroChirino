"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToastProps } from "@/lib/types"

type ToastState = ToastProps & { id: string; visible: boolean }

let toastCount = 0

export function toast(props: ToastProps) {
  const event = new CustomEvent("toast", { detail: { ...props, id: String(++toastCount) } })
  window.dispatchEvent(event)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const addToast = useCallback((toast: ToastProps & { id: string }) => {
    setToasts((prev) => [...prev, { ...toast, visible: true }])

    // Auto dismiss
    const duration = toast.duration || 5000
    setTimeout(() => {
      dismissToast(toast.id)
    }, duration)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)))

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail
      addToast(detail)
    }

    window.addEventListener("toast", handleToast)
    return () => window.removeEventListener("toast", handleToast)
  }, [addToast])

  if (toasts.length === 0) return <>{children}</>

  return (
    <>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs sm:top-4 sm:right-4 sm:left-auto sm:transform-none sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-white border rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all duration-300",
              toast.variant === "destructive" ? "border-red-500" : "border-gray-200",
              toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
          >
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h3
                  className={cn(
                    "font-semibold text-sm truncate",
                    toast.variant === "destructive" ? "text-red-600" : "text-gray-900",
                  )}
                >
                  {toast.title}
                </h3>
              )}
              {toast.description && (
                <p className="text-sm text-gray-600 mt-1 truncate line-clamp-2">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-500 hover:text-gray-900"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export function useToast() {
  return { toast }
}
