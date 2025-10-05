import { Crown, Zap, Heart, Headphones, Gift, Calendar } from "lucide-react"

export default function VipBenefits() {
  const benefits = [
    {
      icon: Crown,
      title: "Acceso Exclusivo",
      description: "Productos únicos solo para miembros VIP",
    },
    {
      icon: Zap,
      title: "Lanzamientos Anticipados",
      description: "Sé el primero en acceder a nuevas colecciones",
    },
    {
      icon: Gift,
      title: "Descuentos Especiales",
      description: "Ofertas exclusivas y promociones personalizadas",
    },
    {
      icon: Headphones,
      title: "Atención Personalizada",
      description: "Soporte directo por WhatsApp las 24 horas",
    },
    {
      icon: Heart,
      title: "Experiencias Únicas",
      description: "Eventos privados y experiencias exclusivas",
    },
    {
      icon: Calendar,
      title: "Preventa Prioritaria",
      description: "Reserva productos antes de su lanzamiento oficial",
    },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 my-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-orange rounded-full mb-4">
          <Crown className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Beneficios Exclusivos VIP</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Disfruta de una experiencia de compra única con acceso a productos exclusivos, descuentos especiales y
          atención personalizada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-orange/20 rounded-full mb-4">
                <Icon className="h-6 w-6 text-accent-orange" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-300 text-sm">{benefit.description}</p>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
          Contacto VIP WhatsApp
        </a>
      </div>
    </div>
  )
}
