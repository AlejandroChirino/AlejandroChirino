"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /**
   * mode: 'bottom' (default) behaves as a bottom sheet.
   * 'center' behaves as a centered dialog on large screens and can be full-screen on mobile.
   */
  mode?: "bottom" | "center"
  /** When using mode="center", make it occupy full height on small screens */
  fullScreenOnMobile?: boolean
}

export default function ActionSheet({ open, onClose, title, children, className, mode = "bottom", fullScreenOnMobile = false }: ActionSheetProps) {
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

  const outer = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex",
        // center on large screens, bottom on mobile for mode="center"
        mode === "center" ? "items-end lg:items-center justify-center" : "flex-col",
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
          // bottom sheet styles
          mode === "bottom"
            ? "mt-auto w-full rounded-t-2xl bg-white shadow-lg border-t border-gray-100"
            : // center mode: modal centered on lg+, full width on mobile if requested
              `w-full lg:max-w-3xl bg-white shadow-lg border border-gray-100 rounded-lg ${fullScreenOnMobile ? "h-full lg:h-auto rounded-none lg:rounded-lg" : "rounded-lg"}`,
          "transition-transform duration-300 ease-out",
          // animation: translate for bottom, scale/fade for center
          mode === "bottom" ? (visible ? "translate-y-0" : "translate-y-full") : (visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"),
          "max-h-[90vh] overflow-hidden flex flex-col",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for bottom sheet only */}
        {mode === "bottom" && (
          <div className="w-full pt-3 flex justify-center">
            <div className="h-1.5 w-10 rounded-full bg-gray-300" />
          </div>
        )}
        {title && <div className="px-4 pb-2 text-sm font-medium text-gray-900">{title}</div>}
        <div className="px-4 pb-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )

  // Mount in portal to avoid stacking context issues
  if (typeof document !== "undefined") {
    return createPortal(outer, document.body)
  }

  return outer
}
