import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"

// Importar los providers
import { CartProvider } from "@/contexts/cart-context"
import { ToastProvider } from "@/components/ui/use-toast"

export const metadata: Metadata = {
  title: "La L Fashion - Ropa y Zapatos",
  description: "Tienda de moda online - Ropa y zapatos para hombre y mujer",
    generator: 'v0.app'
}

// Modificar el RootLayout para incluir los providers
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white">
        <CartProvider>
          <ToastProvider>{children}</ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
