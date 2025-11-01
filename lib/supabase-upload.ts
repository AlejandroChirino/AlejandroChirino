import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase para uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Sube una imagen al bucket de Supabase Storage
 * @param file - Archivo de imagen a subir
 * @returns URL pública de la imagen subida
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen")
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error("La imagen excede el tamaño máximo de 5MB")
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `products/${fileName}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      console.error("Error uploading to Supabase Storage:", error)
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen")
    }

    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadImage:", error)
    throw error
  }
}

/**
 * Elimina una imagen del bucket de Supabase Storage
 * @param imageUrl - URL pública de la imagen a eliminar
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/product-images\/(.+)/)

    if (!pathMatch || !pathMatch[1]) {
      console.warn("No se pudo extraer el path de la imagen:", imageUrl)
      return
    }

    const filePath = pathMatch[1]

    // Eliminar archivo de Supabase Storage
    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) {
      console.error("Error deleting from Supabase Storage:", error)
      throw new Error(`Error al eliminar imagen: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteImage:", error)
    throw error
  }
}
