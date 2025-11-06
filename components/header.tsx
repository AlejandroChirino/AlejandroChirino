"use client"

import { memo, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Menu, Search, User, Heart, X, Crown, ChevronRight, ShoppingBag } from "lucide-react"
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

      {/* Mobile menu overlay (full-screen, white, slide-in) */}
      {isMobileMenuOpen && (
        <MobileMenuOverlay onClose={closeMobileMenu} />
      )}
    </>
  )
})

export default Header

// Subcomponente del Menú Móvil para aislar cambios y no afectar desktop
function MobileMenuOverlay({ onClose }: { onClose: () => void }) {
  const [slideIn, setSlideIn] = useState(false)
  const [bouncePhase, setBouncePhase] = useState(false)
  const [openSub, setOpenSub] = useState<Record<string, boolean>>({})

  // Animación de entrada
  useEffect(() => {
    // activar transición al montar con leve "bounce"
    const t1 = setTimeout(() => setSlideIn(true), 0)
    const t2 = setTimeout(() => setBouncePhase(true), 300)
    const t3 = setTimeout(() => setBouncePhase(false), 300 + 150)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const handleClose = useCallback(() => {
    setSlideIn(false)
    // Esperar la duración de la transición antes de desmontar
    setTimeout(() => onClose(), 300)
  }, [onClose])

  const toggleSub = useCallback((key: string) => {
    setOpenSub((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const MenuItem = ({ href, label, onClick, colorClass }: { href: string; label: string; onClick?: () => void; colorClass?: string }) => (
    <Link
      href={href}
      className={`block py-4 text-lg font-semibold tracking-wide ${colorClass ?? "text-gray-900"} hover:text-accent-orange transition-colors`}
      onClick={() => {
        onClick?.()
        handleClose()
      }}
    >
      {label}
    </Link>
  )

  const ExpandableItem = ({
    label,
    slug,
    items,
  }: {
    label: string
    slug: string
    items: { label: string; href: string }[]
  }) => (
    <div className="border-b border-gray-100">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-lg font-bold text-gray-900"
        onClick={() => toggleSub(slug)}
        aria-expanded={!!openSub[slug]}
        aria-controls={`sub-${slug}`}
      >
        <span>{label}</span>
        <ChevronRight className={`h-5 w-5 transition-transform ${openSub[slug] ? "rotate-90" : ""} text-[#4CAF50]`} />
      </button>
      <div
        id={`sub-${slug}`}
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${openSub[slug] ? "max-h-96" : "max-h-0"}`}
      >
        <div className="pl-4 pb-2">
          {items.map((it) => (
            <MenuItem key={it.label} href={it.href} label={it.label} />
          ))}
        </div>
      </div>
    </div>
  )

  // Subcategorías de ejemplo (puedes ajustar los href según tu routing real)
  const subHombre = [
    { label: "Camisetas", href: "/hombre?sub=camisetas" },
    { label: "Pantalones", href: "/hombre?sub=pantalones" },
    { label: "Calzado", href: "/hombre?sub=calzado" },
  ]
  const subMujer = [
    { label: "Tops", href: "/mujer?sub=tops" },
    { label: "Vestidos", href: "/mujer?sub=vestidos" },
    { label: "Calzado", href: "/mujer?sub=calzado" },
  ]
  const subAccesorios = [
    { label: "Gorras", href: "/accesorios?sub=gorras" },
    { label: "Cinturones", href: "/accesorios?sub=cinturones" },
    { label: "Bolsos", href: "/accesorios?sub=bolsos" },
  ]

  const translateClass = !slideIn ? "-translate-x-full" : bouncePhase ? "translate-x-1" : "translate-x-0"
  const durationClass = bouncePhase ? "duration-150" : "duration-300"

  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden bg-white transform transition-transform ease-out ${durationClass} ${translateClass} shadow-[0_0_24px_rgba(0,0,0,0.06)]`}
      role="dialog"
      aria-modal="true"
      aria-label="Menú móvil"
    >
      {/* Top bar con logo y botón cerrar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        <Link href="/" className="font-extrabold text-xl tracking-wide text-gray-900 whitespace-nowrap overflow-hidden">
          LA <span className="text-accent-orange">L</span> FASHION
        </Link>
        <button
          onClick={handleClose}
          aria-label="Cerrar menú"
          className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Contenido del menú */}
      <div className="h-[calc(100vh-64px-72px)] overflow-y-auto px-4">
        <nav className="divide-y divide-gray-100" role="navigation" aria-label="Navegación móvil">
          <MenuItem href="/" label="Inicio" />

          <ExpandableItem label="Hombre" slug="hombre" items={subHombre} />
          <ExpandableItem label="Mujer" slug="mujer" items={subMujer} />
          <ExpandableItem label="Accesorios" slug="accesorios" items={subAccesorios} />

          <MenuItem href="/nuevo" label="Nuevo" colorClass="text-[#4CAF50]" />
          <MenuItem href="/colaboraciones" label="Colaboraciones" />
          <MenuItem href="/mundo-la-fashion" label="Mundo La L" />
          <MenuItem href="/rebajas" label="Rebajas" colorClass="text-[#F44336]" />
          <MenuItem href="/favoritos" label="Favoritos" />
        </nav>
      </div>

      {/* Footer fijo con iconos VIP y Carrito */}
      <div className="h-[72px] px-4 border-t border-gray-100 flex items-center justify-between">
        <Link
          href="/vip"
          className="flex-1 mr-2 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold"
          onClick={handleClose}
        >
          <Crown className="h-5 w-5 text-accent-orange" />
          Acceso VIP
        </Link>
        <Link
          href="/carrito"
          className="flex-1 ml-2 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold"
          onClick={handleClose}
        >
          <ShoppingBag className="h-5 w-5" />
          Carrito
        </Link>
      </div>
    </div>
  )
}
