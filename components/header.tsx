"use client"

import { memo, useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, Search, User, Heart, X, Crown, ChevronRight, ShoppingBag, ChevronLeft } from "lucide-react"
// Importar el CartBadge
import CartBadge from "@/components/cart-badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { SUBCATEGORIAS } from "@/lib/types"
import { slugFromLabel } from "@/lib/subcategoryUtils"

const Header = memo(function Header({ initialUser }: { initialUser?: any | null }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  // State to hide/show header on scroll (hide when scrolling down)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const router = useRouter()

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const toggleSearch = useCallback(() => {
    // Open the dedicated search page in a new tab/window.
    // If the current URL has a `q` param, forward it so the search input
    // on `/buscar` auto-puebla.
    try {
      if (typeof window !== "undefined") {
        const currentQ = new URLSearchParams(window.location.search).get("q")
        const url = currentQ ? `/buscar?q=${encodeURIComponent(currentQ)}` : `/buscar`
        window.open(url, "_blank")
        return
      }
    } catch (e) {
      // fallback to router push if window.open fails
    }

    try {
      router.push(`/buscar`)
    } catch (e) {
      try { window.location.href = `/buscar` } catch (err) {}
    }
  }, [router])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // legacy search UI removed — searches handled on /buscar

  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Estado de usuario para mostrar perfil / logout
  const [user, setUser] = useState<any | null>(null)
  const initialUserRef = useRef<any | null>(initialUser ?? null)

  useEffect(() => {
    let mounted = true

    // If the server passed an initial value, it can be either a Promise
    // (thenable) or a plain user object. Handle both safely to avoid
    // runtime errors when Next serializes/hydrates props.
    const initial = initialUserRef.current
    if (initial) {
      // If a thenable was accidentally passed in, handle it, otherwise
      // assume it's already the resolved user object.
      if (typeof (initial as any)?.then === "function") {
        try {
          const maybePromise = (initial as any).then((u: any) => {
            if (!mounted) return
            setUser(u)
          })
          if (maybePromise && typeof maybePromise.catch === "function") {
            maybePromise.catch(() => {})
          }
        } catch (e) {
          // ignore
        }
      } else {
        setUser(initial as any)
      }
    }

    const supabase = createBrowserClient()

    // then subscribe to client auth changes (if available)
    let sub: any = null
    try {
      const maybeSub = supabase?.auth?.onAuthStateChange?.((_event: any, session: any) => {
        if (!mounted) return
        setUser(session?.user ?? null)
      })
      sub = maybeSub?.data ?? maybeSub
    } catch (e) {
      // ignore subscription errors
    }

    // also attempt to get current client user if no server data
    try {
      const maybeGet = supabase?.auth?.getUser?.()
      if (maybeGet && typeof maybeGet.then === "function") {
        maybeGet.then((res: any) => {
          if (!mounted) return
          setUser((prev) => prev ?? res?.data?.user ?? null)
        }).catch(() => {})
      } else if (maybeGet?.data?.user) {
        setUser((prev) => prev ?? maybeGet.data.user ?? null)
      }
    } catch (e) {
      // ignore
    }

    return () => {
      mounted = false
      try { sub?.subscription?.unsubscribe?.() } catch (e) {}
    }
  }, [])

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const THRESHOLD = 10

    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const delta = currentY - lastScrollY.current
        if (Math.abs(delta) < THRESHOLD) {
          // ignore small deltas
          ticking.current = false
          return
        }

        if (currentY > lastScrollY.current && currentY > 50) {
          // scrolling down and past top area -> hide
          setIsHeaderHidden(true)
        } else {
          // scrolling up -> show
          setIsHeaderHidden(false)
        }

        lastScrollY.current = currentY
        ticking.current = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const headerTransformClass = isHeaderHidden ? "-translate-y-full" : "translate-y-0"

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transform transition-transform duration-300 ${headerTransformClass}`}>
        {/* Top bar: layout móvil con 3 columnas (menu | logo centrado | iconos) */}
  <div className="h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center px-3 overflow-hidden">
          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors justify-self-start"
            onClick={toggleMobileMenu}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Logo (forzar una sola línea y evitar wrap en móviles) */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 justify-self-center overflow-hidden max-w-full"
            aria-label="Inicio LA FASHION"
          >
            <span className="font-bold whitespace-nowrap flex-shrink-0 leading-none text-[clamp(16px,5vw,1.5rem)]">
              LA <span className="text-accent-orange">⚡</span> FASHION
            </span>
          </Link>

          {/* Navigation icons */}
          <nav
            className="flex items-center gap-1 sm:gap-2 min-w-0 justify-self-end pr-1"
            role="navigation"
            aria-label="Navegación principal"
          >
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Buscar productos"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* VIP Access - Solo visible en desktop */}
            <Link
              href="/vip"
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Acceso VIP"
              title="Acceso VIP"
            >
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-accent-orange" />
            </Link>

            {user ? (
              <>
                <Link
                  href="/cuenta/perfil"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Perfil de usuario"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                {/* Sign-out is intentionally only available inside the profile page. */}
              </>
            ) : (
              <Link
                href="/cuenta"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Mi cuenta"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            )}

            <Link
              href="/favoritos"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Mis favoritos"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <CartBadge className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" />
          </nav>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:block h-12 border-t border-gray-100" role="navigation" aria-label="Categorías">
          <div className="container mx-auto h-full flex items-center gap-8 px-4">
            <Link href="/todo" className="text-sm font-medium hover:text-accent-orange transition-colors">
              TODO
            </Link>
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

        {/* Search UI removed from header — `/buscar` page handles searching */}
      </header>

      {/* Spacer: collapse when header is hidden so content moves up */}
      <div className={`${isHeaderHidden ? "h-0" : "h-16 lg:h-28"}`} />

      {/* Mobile menu overlay (full-screen, white, slide-in) */}
      {isMobileMenuOpen && (
        <MobileMenuOverlay onClose={closeMobileMenu} openerRef={menuButtonRef} />
      )}
    </>
  )
})

export default Header

// Subcomponente del Menú Móvil para aislar cambios y no afectar desktop
function MobileMenuOverlay({ onClose, openerRef }: { onClose: () => void; openerRef?: React.RefObject<HTMLButtonElement> }) {
  const router = useRouter()
  const [slideIn, setSlideIn] = useState(false)
  const [bouncePhase, setBouncePhase] = useState(false)
  const [activeCategory, setActiveCategory] = useState<null | { label: string; items: { label: string; href: string }[] }>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const backButtonRef = useRef<HTMLButtonElement | null>(null)
  const openedFromRef = useRef<HTMLElement | null>(null)

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
    setTimeout(() => {
      onClose()
      try {
        openerRef?.current?.focus()
      } catch (e) {}
    }, 300)
  }, [onClose, openerRef])

  const openSubPanel = useCallback((label: string, items: { label: string; href: string }[]) => {
    // store the element that opened the subpanel so we can return focus when closing
    openedFromRef.current = document.activeElement as HTMLElement | null
    setActiveCategory({ label, items })
  }, [])

  const closeSubPanel = useCallback(() => {
    setActiveCategory(null)
    // after the slide animation, return focus to the control that opened the subpanel
    setTimeout(() => {
      try {
        openedFromRef.current?.focus()
      } catch (e) {}
    }, 300)
  }, [])

  const MenuItem = ({ href, label, onClick, colorClass }: { href: string; label: string; onClick?: () => void; colorClass?: string }) => (
    <button
      type="button"
      className={`block w-full text-left py-4 text-lg font-semibold tracking-wide ${colorClass ?? "text-gray-900"} hover:text-accent-orange transition-colors`}
      onClick={async () => {
        try {
          console.debug("[MobileMenu] navigating to:", href, "label:", label)
          await router.push(href)
        } catch (e) {
          // fallback: change location
          try { window.location.href = href } catch (err) {}
        }
        onClick?.()
        handleClose()
      }}
    >
      {label}
    </button>
  )

  // focus management: focus close button on open, focus back button when opening subpanel
  useEffect(() => {
    if (slideIn) {
      // small timeout to wait DOM focusable elements
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [slideIn])

  useEffect(() => {
    if (activeCategory) {
      const t = setTimeout(() => backButtonRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [activeCategory])

  // keyboard handling and focus trap inside overlay
  useEffect(() => {
    const root = overlayRef.current
    if (!root) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        if (activeCategory) closeSubPanel()
        else handleClose()
        return
      }

      if (e.key === "Tab") {
        const focusable = Array.from(root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }

    root.addEventListener("keydown", handleKeyDown)
    return () => root.removeEventListener("keydown", handleKeyDown)
  }, [activeCategory, handleClose, closeSubPanel])

  // Flyout behaviour: when a category with subitems is activated, open a secondary panel
  // that slides from the right. We keep the main panel in DOM for animation and screen-readers.

  // Construir subitems dinámicamente a partir de SUBCATEGORIAS
  const makeItems = (categoryKey: keyof typeof SUBCATEGORIAS, basePath: string) => {
    const items = SUBCATEGORIAS[categoryKey] || []
    // Always include "Ver todo" as the first item (no ?sub param)
    const verTodo = { label: "Ver todo", href: basePath }
    const mapped = items.map((label) => ({
      label,
      href: `${basePath}?sub=${encodeURIComponent(slugFromLabel(categoryKey, label))}`,
    }))

    // Prepend Ver todo but ensure there are no duplicate labels (SUBCATEGORIAS may already include "Ver todo")
    const combined = [verTodo, ...mapped]
    const dedupedMap = new Map<string, { label: string; href: string }>()
    for (const it of combined) {
      if (!dedupedMap.has(it.label)) dedupedMap.set(it.label, it)
    }
    return Array.from(dedupedMap.values())
  }

  const subHombre = makeItems("hombre", "/hombre")
  const subMujer = makeItems("mujer", "/mujer")
  const subAccesorios = makeItems("accesorios", "/accesorios")

  const translateClass = !slideIn ? "-translate-x-full" : bouncePhase ? "translate-x-1" : "translate-x-0"
  const durationClass = bouncePhase ? "duration-150" : "duration-300"

  return (
    <div
      ref={overlayRef}
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
          ref={closeButtonRef}
          onClick={handleClose}
          aria-label="Cerrar menú"
          className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Contenido del menú con panels para flyout */}
      <div className="h-[calc(100vh-64px-72px)] relative px-0">
        {/* Contenedor relativo que mantiene ambos paneles (main y sub) */}
        <div className="absolute inset-0 flex">
          {/* Panel principal */}
          <div
            className={`w-full px-4 overflow-y-auto transition-transform duration-300 ease-out ${activeCategory ? "-translate-x-full" : "translate-x-0"}`}
            aria-hidden={!!activeCategory}
          >
            <nav className="divide-y divide-gray-100" role="navigation" aria-label="Navegación móvil">
              <MenuItem href="/todo" label="Todo" />
              <MenuItem href="/" label="Inicio" />

              <div className="border-b border-gray-100">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-4 text-lg font-bold text-gray-900"
                  onClick={() => openSubPanel("Hombre", subHombre)}
                  aria-expanded={activeCategory?.label === "Hombre"}
                  aria-controls="sub-hombre"
                >
                  <span>Hombre</span>
                  <ChevronRight className="h-5 w-5 text-[#4CAF50]" />
                </button>
              </div>

              <div className="border-b border-gray-100">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-4 text-lg font-bold text-gray-900"
                  onClick={() => openSubPanel("Mujer", subMujer)}
                  aria-expanded={activeCategory?.label === "Mujer"}
                  aria-controls="sub-mujer"
                >
                  <span>Mujer</span>
                  <ChevronRight className="h-5 w-5 text-[#4CAF50]" />
                </button>
              </div>

              <div className="border-b border-gray-100">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-4 text-lg font-bold text-gray-900"
                  onClick={() => openSubPanel("Accesorios", subAccesorios)}
                  aria-expanded={activeCategory?.label === "Accesorios"}
                  aria-controls="sub-accesorios"
                >
                  <span>Accesorios</span>
                  <ChevronRight className="h-5 w-5 text-[#4CAF50]" />
                </button>
              </div>

              <MenuItem href="/nuevo" label="Nuevo" colorClass="text-[#4CAF50]" />
              <MenuItem href="/colaboraciones" label="Colaboraciones" />
              <MenuItem href="/mundo-la-fashion" label="Mundo La L" />
              <MenuItem href="/rebajas" label="Rebajas" colorClass="text-[#F44336]" />
              <MenuItem href="/favoritos" label="Favoritos" />
            </nav>
          </div>

          {/* Panel secundario (flyout) */}
          <div
            className={`w-full absolute inset-y-0 right-0 bg-white px-4 overflow-y-auto transition-transform duration-300 ease-out ${activeCategory ? "translate-x-0" : "translate-x-full"}`}
            role="region"
            aria-labelledby="submenu-title"
            aria-hidden={!activeCategory}
          >
            {/* Cabecera del subpanel con botón volver */}
            <div className="flex items-center gap-3 py-4 border-b border-gray-100">
              <button
                ref={backButtonRef}
                onClick={closeSubPanel}
                aria-label="Volver"
                className="p-2 rounded hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 id="submenu-title" className="text-lg font-bold">{activeCategory?.label}</h3>
            </div>

            <nav className="pt-2">
              {activeCategory?.items.map((it) => (
                <MenuItem key={it.href} href={it.href} label={it.label} />
              ))}
            </nav>
          </div>
        </div>
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
