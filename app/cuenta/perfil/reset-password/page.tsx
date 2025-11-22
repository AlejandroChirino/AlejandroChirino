import ResetPasswordClient from "./ResetPasswordClient"

export const revalidate = 0

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* ocultar el header global y su espaciador solo en esta página */}
      <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

      <h1 className="text-lg font-bold uppercase">RESETEAR CONTRASEÑA</h1>
      <p className="mt-2 text-base text-gray-500 font-normal max-w-2xl">Ingresa tu contraseña actual y la nueva contraseña.</p>

      <div className="mt-6">
        {/* @ts-ignore */}
        <ResetPasswordClient />
      </div>
    </div>
  )
}
