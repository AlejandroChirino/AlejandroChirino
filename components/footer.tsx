import { memo } from "react"
import Link from "next/link"

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div>
            <h3 className="text-lg font-bold mb-4">La L Fashion</h3>
            <p className="text-gray-400">Tu tienda de confianza para ropa y zapatos de calidad.</p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorías</h4>
            <nav className="space-y-2" role="navigation" aria-label="Categorías del pie de página">
              <Link href="/mujer" className="block text-gray-400 hover:text-white transition-colors">
                Mujer
              </Link>
              <Link href="/hombre" className="block text-gray-400 hover:text-white transition-colors">
                Hombre
              </Link>
              <Link href="/accesorios" className="block text-gray-400 hover:text-white transition-colors">
                Accesorios
              </Link>
              <Link href="/nuevo" className="block text-gray-400 hover:text-white transition-colors">
                Nuevo
              </Link>
            </nav>
          </div>

          {/* Help section */}
          <div>
            <h4 className="font-semibold mb-4">Ayuda</h4>
            <nav className="space-y-2" role="navigation" aria-label="Enlaces de ayuda">
              <Link href="/contacto" className="block text-gray-400 hover:text-white transition-colors">
                Contacto
              </Link>
              <Link href="/envios" className="block text-gray-400 hover:text-white transition-colors">
                Envíos
              </Link>
              <Link href="/devoluciones" className="block text-gray-400 hover:text-white transition-colors">
                Devoluciones
              </Link>
            </nav>
          </div>

          {/* Social media */}
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Síguenos en Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Síguenos en Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} La L Fashion. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
})

export default Footer
