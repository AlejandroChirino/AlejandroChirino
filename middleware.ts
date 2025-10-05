import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Proteger rutas de admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Verificar si hay una sesión válida
    const token = req.cookies.get("sb-access-token")

    if (!token) {
      // Redirigir al login si no hay token
      return NextResponse.redirect(new URL("/cuenta", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
