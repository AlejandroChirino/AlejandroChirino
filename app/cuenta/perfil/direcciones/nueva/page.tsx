import DireccionFormClient from "../DireccionFormClient"

export default function NuevaDireccionPage() {
  return (
    <div className="min-h-screen">
      <main className="py-6">
        <div className="max-w-3xl mx-auto px-6">
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          <DireccionFormClient />
        </div>
      </main>
    </div>
  )
}
