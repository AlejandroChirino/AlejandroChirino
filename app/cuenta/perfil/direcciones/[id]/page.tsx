import DireccionFormClient from "../DireccionFormClient"

export default function EditDireccionPage({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <div className="min-h-screen">
      <main className="py-6">
        <div className="max-w-3xl mx-auto px-6">
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          <DireccionFormClient id={id} />
        </div>
      </main>
    </div>
  )
}
