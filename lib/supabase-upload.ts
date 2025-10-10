import { supabase } from "./supabase"

export async function uploadImageToSupabase(file: File): Promise<string> {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading to Supabase:", error)
    throw new Error("Error al subir imagen a Supabase")
  }
}
