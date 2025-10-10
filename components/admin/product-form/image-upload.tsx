"use client"

import type React from "react"
import { useState } from "react"
import Input from "@/components/ui/input"
import { Upload, ImageIcon, X, AlertCircle, Loader2 } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"
import { uploadImage } from "@/lib/supabase-upload"

interface ImageUploadProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function ImageUpload({ formData, updateField }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleFileUpload = async (file?: File) => {
    setError(null)
    setUploadProgress(0)

    // Validación del archivo
    if (!file) {
      setError("No se seleccionó ningún archivo")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona solo archivos de imagen (JPG, PNG, GIF, WebP)")
      return
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError("La imagen es muy grande. Tamaño máximo: 5MB")
      return
    }

    setUploading(true)
    setUploadProgress(30)

    try {
      // Subir a Supabase Storage
      const imageUrl = await uploadImage(file)

      setUploadProgress(100)

      // Guardar URL en el formulario
      updateField("image_url", imageUrl)

      setError(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Error al subir la imagen. Por favor, intenta de nuevo.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleRemoveImage = () => {
    updateField("image_url", "")
    setError(null)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Imagen del producto</h3>

      {formData.image_url ? (
        <div className="relative group">
          <img
            src={formData.image_url || "/placeholder.svg"}
            alt="Producto"
            className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mt-2 text-sm text-gray-500">✓ Imagen cargada correctamente</div>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
            } ${uploading ? "opacity-50 pointer-events-none" : "hover:border-gray-400"}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
                <p className="text-gray-600 mb-2">Subiendo imagen a Supabase...</p>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Arrastra una imagen aquí o haz clic para seleccionar</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label htmlFor="image-upload" className="inline-block cursor-pointer">
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-white hover:bg-gray-100 hover:text-accent-foreground h-10 px-4 py-2 shadow-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar imagen
                  </div>
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm flex-1">{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
                aria-label="Cerrar error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <Input
        label="URL de imagen (alternativo)"
        value={formData.image_url || ""}
        onChange={(e) => {
          updateField("image_url", e.target.value)
          setError(null)
        }}
        placeholder="https://ejemplo.com/imagen.jpg"
        disabled={uploading}
      />

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-xs">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium mb-1">Formatos soportados:</p>
          <p>JPG, PNG, GIF, WebP • Tamaño máximo: 5MB</p>
          <p className="mt-1 text-blue-600">Las imágenes se almacenan en Supabase Storage</p>
        </div>
      </div>
    </div>
  )
}
