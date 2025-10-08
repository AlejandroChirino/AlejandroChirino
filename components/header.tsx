"use client"

import { memo, useState, useCallback } from "react"
import Link from "next/link"
import { Menu, Search, User, Heart, X, Crown } from "lucide-react"
// Importar el CartBadge
import CartBadge from "@/components/cart-badge"

const Header = memo(function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="h-16 flex items-center justify-between px-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold">
              LA <span className="text-accent-orange">⚡</span> FASHION
            </span>
          </Link>

          {/* Navigation icons */}
          <nav className="flex items-center gap-1" role="navigation" aria-label="Navegación principal">
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Buscar productos"
              aria-expanded={isSearchOpen}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* VIP Access - Solo visible en desktop */}
            <Link
              href="/vip"
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Acceso VIP"
              title="Acceso VIP"
            >
              <Crown className="h-5 w-5 text-accent-orange" />
            </Link>

            <Link href="/cuenta" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Mi cuenta">
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/favoritos"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mis favoritos"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <CartBadge className="p-2 hover:bg-gray-100 rounded-lg transition-colors" />
          </nav>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:block h-12 border-t border-gray-100" role="navigation" aria-label="Categorías">
          <div className="container mx-auto h-full flex items-center gap-8 px-4">
            <Link href="/" className="text-sm font-medium hover:text-accent-orange transition-colors">
              INICIO
            </Link>
            <Link href="/hombre" className="text-sm font-medium hover:text-accent-orange transition-colors">
              HOMBRE
            </Link>
            <Link href="/mujer" className="text-sm font-medium hover:text-accent-orange transition-colors">
              MUJER
            </Link>
            <Link href="/accesorios" className="text-sm font-medium hover:text-accent-orange transition-colors">
              ACCESORIOS
            </Link>
            <Link href="/nuevo" className="text-sm font-medium hover:text-accent-orange transition-colors">
              NUEVO
            </Link>
            <Link href="/colaboraciones" className="text-sm font-medium hover:text-accent-orange transition-colors">
              COLABORACIONES
            </Link>
            <Link href="/mundo-la-fashion" className="text-sm font-medium hover:text-accent-orange transition-colors">
              MUNDO LA L
            </Link>
            <Link href="/rebajas" className="text-sm font-medium hover:text-accent-orange transition-colors">
              REBAJAS
            </Link>
            {/* Agregar enlace VIP en el menú principal */}
            <Link
              href="/vip"
              className="text-sm font-medium hover:text-accent-orange transition-colors flex items-center gap-1"
            >
              <Crown className="h-4 w-4" />
              VIP
            </Link>
          </div>
        </nav>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar productos..."
                className="w-full h-10 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                autoFocus
                aria-label="Buscar productos"
              />
              <button
                onClick={closeSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-28" />

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu} aria-hidden="true" />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Menú</span>
              <button onClick={closeMobileMenu} aria-label="Cerrar menú" className="p-1 hover:bg-gray-100 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="space-y-4" role="navigation" aria-label="Navegación móvil">
              <Link
                href="/"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Inicio
              </Link>
              <Link
                href="/hombre"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Hombre
              </Link>
              <Link
                href="/mujer"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Mujer
              </Link>
              <Link
                href="/accesorios"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Accesorios
              </Link>
              <Link
                href="/nuevo"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Nuevo
              </Link>
              <Link
                href="/colaboraciones"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Colaboraciones
              </Link>
              <Link
                href="/mundo-la-fashion"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Mundo La L
              </Link>
              <Link
                href="/rebajas"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Rebajas
              </Link>
              {/* Agregar VIP al menú móvil */}
              <Link
                href="/vip"
                className="flex items-center gap-2 py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                <Crown className="h-5 w-5" />
                Acceso VIP
              </Link>
              <Link
                href="/favoritos"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Favoritos
              </Link>
              <Link
                href="/carrito"
                className="block py-2 text-lg hover:text-accent-orange transition-colors"
                onClick={closeMobileMenu}
              >
                Carrito
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
})

export default Header
