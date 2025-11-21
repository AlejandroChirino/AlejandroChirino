import { Instagram, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      {/* Sección Superior: Redes Sociales */}
      <div className="container mx-auto px-4 text-center mb-8">
        <div className="flex justify-center gap-6">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 hover:text-pink-500 transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-2 hover:text-blue-600 transition-colors"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="p-2 hover:text-green-500 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      </div>

      {/* Secciones de Navegación y Contacto */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ayudas */}
        <div>
          <h3 className="text-lg font-bold mb-4">AYUDAS</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://wa.me/5352434599"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* LA L FASHION */}
        <div>
          <h3 className="text-lg font-bold mb-4">LA L FASHION</h3>
          <p className="text-sm text-gray-400">
            Tu tienda de confianza para ropa y zapatos de calidad.
          </p>
        </div>

        {/* Categorías */}
        <div>
          <h3 className="text-lg font-bold mb-4">CATEGORÍAS</h3>
          <ul className="space-y-2">
            <li>
              <a href="/mujer" className="hover:text-gray-400 transition-colors">
                Mujer
              </a>
            </li>
            <li>
              <a href="/hombre" className="hover:text-gray-400 transition-colors">
                Hombre
              </a>
            </li>
            <li>
              <a href="/accesorios" className="hover:text-gray-400 transition-colors">
                Accesorios
              </a>
            </li>
            <li>
              <a href="/nuevo" className="hover:text-gray-400 transition-colors">
                Nuevo
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Información de Contacto y Legal */}
      <div className="container mx-auto px-4 mt-8 text-center">
        <p className="text-sm text-gray-400">
          Dirección: Calle Capotico #435 E/ Calle Coronel Montero y Calle Amado Estevez, ciudad Bayamo, provincia Granma, País Cuba
        </p>
        <p className="text-sm text-gray-400 mt-4">© 2025 La L Fashion. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
