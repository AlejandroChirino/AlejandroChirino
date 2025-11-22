import TallasClient from "./TallasClient"

export const revalidate = 0

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* ocultar el header global y su espaciador solo en esta página */}
      <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

      <h1 className="text-lg font-bold uppercase">PREFERENCIAS DE TALLA</h1>
      <p className="mt-2 text-base text-gray-500 font-normal max-w-3xl">Selecciona hasta 3 tallas por subcategoría para recibir recomendaciones y preselecciones al comprar.</p>
      <div className="mt-6">
        {/* Client component handles fetching options and saving preferences */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <TallasClient />
      </div>
    </div>
  )
}
