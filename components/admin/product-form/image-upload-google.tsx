// Componente eliminado: este archivo era una alternativa que intentaba subir imágenes
// mediante un Google Apps Script. Ya no se usa en el formulario de producto principal
// (que importa `./product-form/image-upload`).

export default function ImageUploadGoogleRemoved() {
  // Si por algún motivo este componente se importa en otro sitio, renderizamos
  // un aviso en consola y no mostramos UI para evitar romper el formulario.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn("image-upload-google was removed — use components/admin/product-form/image-upload.tsx (Supabase)")
  }
  return null
}
