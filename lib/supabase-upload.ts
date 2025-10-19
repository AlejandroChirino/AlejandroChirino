import { supabase } from "./supabase"

/**
 * Sube una imagen al bucket de Supabase Storage
 * @param file - Archivo de imagen a subir
 * @returns URL pública de la imagen subida
 */
export async function uploadImage(file: File): Promise<string> {
  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WebP y GIF.")
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error("El archivo es demasiado grande. Tamaño máximo: 5MB.")
  }

  // Generar nombre único
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split(".").pop()
  const fileName = `${timestamp}-${randomString}.${extension}`

  // Subir a Supabase Storage
  const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading to Supabase:", error)
    throw new Error(`Error al subir la imagen: ${error.message}`)
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

/**
 * Elimina una imagen del bucket de Supabase Storage
 * @param url - URL completa de la imagen a eliminar
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extraer el path del archivo de la URL
    const urlParts = url.split("/product-images/")
    if (urlParts.length < 2) {
      throw new Error("URL de imagen inválida")
    }

    const filePath = urlParts[1]

    // Eliminar de Supabase Storage
    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) {
      console.error("Error deleting from Supabase:", error)
      throw new Error(`Error al eliminar la imagen: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteImage:", error)
    // No lanzamos el error para no bloquear otras operaciones
  }
}
