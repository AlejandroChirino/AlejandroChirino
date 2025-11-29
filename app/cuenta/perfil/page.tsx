import PerfilClient from "./PerfilClient"

export default function PerfilPage() {
  return (
    <div className="min-h-screen">
      <main className="py-4">
        <div className="max-w-3xl mx-auto px-4">
          {/* ocultar el header global y su espaciador solo en esta página */}
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          {/* PerfilClient ahora valida la sesión en cliente y obtiene el perfil */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <PerfilClient />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
