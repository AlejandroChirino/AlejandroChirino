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
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-250",
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
            ? "mt-auto w-full rounded-t-3xl bg-white shadow-lg"
            : // center mode: modal centered on lg+, full width on mobile if requested
              `w-full lg:max-w-3xl bg-white shadow-lg rounded-lg ${fullScreenOnMobile ? "h-full lg:h-auto rounded-none lg:rounded-lg" : "rounded-lg"}`,
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
            <div className="h-0.5 w-12 rounded-full bg-gray-200" />
          </div>
        )}

        {/* Content wrapper with ample padding for breathing room */}
        <div className="p-6 overflow-y-auto flex-1">
          {title && <div className="text-base font-semibold text-gray-900 mb-2">{title}</div>}
          <div className="text-sm text-gray-600 mb-4" />
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  )

  // Mount in portal to avoid stacking context issues
  if (typeof document !== "undefined") {
    return createPortal(outer, document.body)
  }

  return outer
}
