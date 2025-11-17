"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X, AlertCircle, RefreshCw } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"

interface ImageUploadProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function ImageUpload({ formData, updateField }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwdB1nLsXwKCdDn4Wos6fzPjdiFfqiCTUZATRrgVrePsDzbmthjDma0Dh5orxtk-ZDjXw/exec"

  const handleFileUpload = async (file?: File, retry = false) => {
    if (!retry) {
      setError(null)
      setRetryCount(0)
    }

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
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("La imagen es muy grande. Tamaño máximo: 5MB")
      return
    }

    setUploading(true)

    try {
      const uploadData = new FormData()
      uploadData.append("file", file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: uploadData,
        signal: controller.signal,
        mode: "no-cors", // Agregar esto para evitar problemas de CORS
      })

      clearTimeout(timeoutId)

      // Con mode: 'no-cors', no podemos leer la respuesta
      // Asumimos que funcionó si no hubo error
      if (response.type === "opaque") {
        // La petición se completó pero no podemos leer la respuesta
        // Necesitamos un método alternativo para verificar
        setError("La imagen se subió pero no se pudo obtener la URL. Por favor, usa el campo de URL alternativo.")
        return
      }

      const data = await response.json()

      if (response.ok && data.url) {
        updateField("image_url", data.url)
        setError(null)
        setRetryCount(0)
      } else {
        throw new Error(data.error || "Error al subir imagen")
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)

      let errorMessage = "Error al subir la imagen. "

      if (error.name === "AbortError") {
        errorMessage += "La subida tardó demasiado. Por favor, intenta con una imagen más pequeña."
      } else if (error.message === "Failed to fetch") {
        errorMessage +=
          "No se pudo conectar con el servidor. Verifica tu conexión a internet o usa el campo de URL alternativo."
      } else {
        errorMessage += error.message || "Por favor, intenta de nuevo."
      }

      setError(errorMessage)

      // Opción de reintentar automáticamente
      if (retryCount < 2 && error.name !== "AbortError") {
        setRetryCount((prev) => prev + 1)
        setTimeout(() => handleFileUpload(file, true), 2000)
      }
    } finally {
      setUploading(false)
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Imagen del producto</h3>

      {formData.image_url ? (
        <div className="relative">
          <img
            src={formData.image_url || "/placeholder.svg"}
            alt="Producto"
            className="w-full max-w-md h-64 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => updateField("image_url", "")}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              {uploading
                ? retryCount > 0
                  ? `Reintentando... (${retryCount}/2)`
                  : "Subiendo imagen..."
                : "Arrastra una imagen aquí o haz clic para seleccionar"}
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label htmlFor="image-upload" className="inline-block cursor-pointer">
              <div
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Subiendo..." : "Seleccionar imagen"}
              </div>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">{error}</div>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="image_url_alt">URL de imagen (alternativo)</Label>
        <Input
          id="image_url_alt"
          value={formData.image_url || ""}
          onChange={(e) => {
            updateField("image_url", e.target.value)
            setError(null)
          }}
          placeholder="https://ejemplo.com/imagen.jpg o https://drive.google.com/..."
          disabled={uploading}
        />
      </div>

      <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB</p>
      <p className="text-xs text-amber-600">
        💡 Si la subida automática falla, puedes subir la imagen manualmente a Google Drive y pegar la URL pública en el
        campo alternativo.
      </p>
    </div>
  )
}
