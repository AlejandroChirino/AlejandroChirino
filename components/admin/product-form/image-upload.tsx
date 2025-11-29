"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"
import { uploadImage } from "@/lib/supabase-upload"
import ConfirmModal from "@/components/confirm-modal"

interface ImageUploadProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function ImageUpload({ formData, updateField }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [images, setImages] = useState<string[]>(() => {
    if (formData.image_urls && formData.image_urls.length > 0) return formData.image_urls
    if (formData.image_url) return [formData.image_url]
    return []
  })
  const [urlInput, setUrlInput] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)

  // Sync local images state when formData changes (important for edit mode)
  useEffect(() => {
    if (formData.image_urls && Array.isArray(formData.image_urls)) {
      setImages(formData.image_urls)
    } else if (formData.image_url) {
      setImages([formData.image_url])
    } else {
      setImages([])
    }
  }, [formData.image_urls, formData.image_url])

  const handleFileUpload = async (file?: File) => {
    if (!file) {
      alert("Por favor, selecciona un archivo.")
      return
    }

    // Validación adicional en el cliente
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.")
      return
    }

    setUploading(true)

    try {
      // Subir a Supabase Storage (sin progreso detallado por ahora)
      const imageUrl = await uploadImage(file)

      // Añadir a la lista local y al formulario
      const next = [...images, imageUrl]
      setImages(next)
      updateField("image_urls", next)
      updateField("image_url", next[0] ?? "")
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al subir la imagen: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Support multiple selection
      const list = Array.from(files)
      ;(async () => {
        setUploading(true)
        for (const f of list) {
          await handleFileUpload(f)
        }
        setUploading(false)
      })()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      ;(async () => {
        setUploading(true)
        for (const f of files) {
          await handleFileUpload(f)
        }
        setUploading(false)
      })()
    }
  }

  const handleRemoveImage = () => {
    setImages([])
    updateField("image_urls", [])
    updateField("image_url", "")
  }

  const handleRemoveSingle = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    setImages(next)
    updateField("image_urls", next)
    updateField("image_url", next[0] ?? "")
  }

  const handleAddUrl = () => {
    if (!urlInput) return
    const next = [...images, urlInput]
    setImages(next)
    updateField("image_urls", next)
    updateField("image_url", next[0] ?? "")
    setUrlInput("")
  }

  return (
    <>
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Imagen del producto</h3>

      {/* Thumbnails (if any) */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative inline-block">
              <img src={img || "/placeholder.svg"} alt={`Imagen ${idx + 1}`} className="w-full h-36 object-cover rounded-lg border border-gray-300" />
              <button
                type="button"
                onClick={() => {
                  setPendingDeleteIndex(idx)
                  setConfirmOpen(true)
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Eliminar imagen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area - always visible so user can add more images */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Arrastra una imagen aquí o haz clic para seleccionar</p>

          {uploading && (
            <div className="mb-4 flex items-center justify-center flex-col">
              <Upload className="h-6 w-6 text-gray-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600 mt-1">Subiendo...</p>
            </div>
          )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label htmlFor="image-upload" className="inline-block cursor-pointer">
          <div
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Subiendo..." : images.length > 0 ? "Agregar imágenes" : "Seleccionar imagen"}
          </div>
        </label>
        </div>

        <div className="space-y-2 mt-3">
          <label className="block text-sm font-medium text-gray-700">Agregar URL de imagen (opcional)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button onClick={handleAddUrl} type="button" className="px-3 py-2 bg-gray-800 text-white rounded-md">Agregar</button>
          </div>
          <p className="text-xs text-gray-500">Las URLs añadidas se guardarán en `image_urls` y `image_url` se actualizará al primer elemento.</p>
        </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">URL de imagen (alternativo)</label>
        <input
          type="url"
          value={formData.image_url || ""}
          onChange={(e) => updateField("image_url", e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500">
          También puedes pegar una URL directamente si ya tienes la imagen alojada
        </p>
      </div>

      <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB</p>
    </div>
    {/* Confirm modal for deleting a single image */}
    <ConfirmModal
      open={confirmOpen}
      title="Eliminar imagen"
      description="¿Deseas eliminar esta imagen? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      onConfirm={() => {
        if (pendingDeleteIndex !== null) {
          const next = images.filter((_, i) => i !== pendingDeleteIndex)
          setImages(next)
          updateField("image_urls", next)
          updateField("image_url", next[0] ?? "")
        }
        setPendingDeleteIndex(null)
        setConfirmOpen(false)
      }}
      onCancel={() => {
        setPendingDeleteIndex(null)
        setConfirmOpen(false)
      }}
    />
    </>
  )
}
