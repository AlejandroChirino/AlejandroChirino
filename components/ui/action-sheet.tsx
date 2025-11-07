"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function ActionSheet({ open, onClose, title, children, className }: ActionSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)
  const sheetRef = useRef<HTMLDivElement | null>(null)

  // Control de montaje y animación
  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 250)
      return () => clearTimeout(t)
    }
  }, [open])

  // Escape + bloqueo scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", onKey)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", onKey)
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        visible ? "pointer-events-auto" : "pointer-events-none",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Opciones"}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-250",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "mt-auto w-full rounded-t-2xl bg-white shadow-lg border-t border-gray-100",
          "transition-transform duration-300 ease-out",
          visible ? "translate-y-0" : "translate-y-full",
          "max-h-[75vh] overflow-hidden flex flex-col",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-full pt-3 flex justify-center">
          <div className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>
        {title && <div className="px-4 pb-2 text-sm font-medium text-gray-900">{title}</div>}
        <div className="px-4 pb-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
