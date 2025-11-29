import DireccionesClient from "./DireccionesClient"

export default function DireccionesPage() {
  return (
    <div className="min-h-screen">
      <main className="py-6">
        <div className="max-w-3xl mx-auto px-6">
          {/* ocultar header global para mantener la estética minimalista */}
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          <DireccionesClient />
        </div>
      </main>
    </div>
  )
}
