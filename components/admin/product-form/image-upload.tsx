"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"
import { uploadImage } from "@/lib/supabase-upload"

interface ImageUploadProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function ImageUpload({ formData, updateField }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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
    setUploadProgress(0)

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      // Subir a Supabase Storage
      const imageUrl = await uploadImage(file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Guardar URL en el formulario
      updateField("image_url", imageUrl)

      // Mostrar mensaje de éxito
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al subir la imagen: ${errorMessage}`)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
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

  const handleRemoveImage = () => {
    updateField("image_url", "")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Imagen del producto</h3>

      {formData.image_url ? (
        <div className="relative inline-block">
          <img
            src={formData.image_url || "/placeholder.svg"}
            alt="Producto"
            className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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

          {uploading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-2">Subiendo... {uploadProgress}%</p>
            </div>
          )}

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
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Subiendo..." : "Seleccionar imagen"}
            </div>
          </label>
        </div>
      )}

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
  )
}
