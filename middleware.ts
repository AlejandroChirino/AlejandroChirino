import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Proteger rutas de admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Verificar si hay una sesión válida
    const token = req.cookies.get("sb-access-token")
    // Permitir acceso con cookie de admin (establecida desde el login de /cuenta)
    const adminSession = req.cookies.get("admin_session")?.value

    // Si no hay token de Supabase ni cookie de admin explícita, redirigir a /cuenta
    if (!token && adminSession !== "lalfashion0@gmail.com") {
      return NextResponse.redirect(new URL("/cuenta", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
