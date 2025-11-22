"use client"

import { useEffect } from "react"

type ConfirmModalProps = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title = "¿Estás seguro?",
  description,
  confirmLabel = "Sí, cerrar sesión",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    // prevent background scroll when modal open
    if (typeof document === "undefined") return
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Sheet for mobile, centered panel for desktop */}
      <div className="relative w-full sm:max-w-lg">
        <div className="bg-white rounded-t-xl sm:rounded-xl shadow-lg p-4 sm:p-6 transform transition-transform">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-accent-orange text-white hover:brightness-95 text-sm font-medium"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
