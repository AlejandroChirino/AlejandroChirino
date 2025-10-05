"use client"

import type React from "react"
import { useState } from "react"
import Input from "@/components/ui/input"
import { Upload, ImageIcon, X } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"

interface ImageUploadProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function ImageUpload({ formData, updateField }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (file?: File) => {
    // ⚠️ Validación robusta antes de acceder a file.type
    if (!file || typeof file.type !== "string" || !file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.")
      return
    }

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwdB1nLsXwKCdDn4Wos6fzPjdiFfqiCTUZATRrgVrePsDzbmthjDma0Dh5orxtk-ZDjXw/exec",
        {
          method: "POST",
          body: uploadData,
        },
      )

      const data = await response.json()

      if (response.ok && data.url) {
        updateField("image_url", data.url)
      } else {
        throw new Error(data.error || "Error al subir imagen")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen. Por favor, intenta de nuevo.")
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
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
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
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="image-upload" />
          <label htmlFor="image-upload" className="inline-block cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Subiendo..." : "Seleccionar imagen"}
            </div>
          </label>
        </div>
      )}

      <Input
        label="URL de imagen (alternativo)"
        value={formData.image_url || ""}
        onChange={(e) => updateField("image_url", e.target.value)}
        placeholder="https://ejemplo.com/imagen.jpg"
      />

      <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB</p>
    </div>
  )
}
