"use client"

import { useState, useEffect } from "react"
import { safeSupabase } from "@/lib/supabaseClient"
import { formatDate, formatPrice } from "@/lib/utils"

interface ReserveWhatsappButtonProps {
  articuloId: string
  articuloName: string
  price: number
  estimatedArrival: string
  phoneTo?: string // optional business phone to send to (E.164 without +)
}

export default function ReserveWhatsappButton({ articuloId, articuloName, price, estimatedArrival, phoneTo }: ReserveWhatsappButtonProps) {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<{ full_name?: string; phone?: string; email?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { user } = {} } = await safeSupabase.auth.getUser()
        if (!user || !mounted) return

        const { data: profile } = await safeSupabase.from("user_profiles").select("full_name, phone, email").eq("id", user.id).maybeSingle()
        if (!mounted) return
        setUserProfile(profile || null)
      } catch (e) {
        // ignore
      }
    })()

    return () => { mounted = false }
  }, [])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const name = userProfile?.full_name || "(nombre no disponible)"
      const phone = userProfile?.phone || "(teléfono no disponible)"
      const email = userProfile?.email || "(email no disponible)"
      const message = `Hola,%0Aquiero reservar este artículo:%0A- Artículo: ${articuloName}%0A- ID: ${articuloId}%0A- Precio estimado: ${formatPrice(price)}%0A- Llegada estimada: ${formatDate(estimatedArrival)}%0A%0AMis datos:%0A- Nombre: ${name}%0A- Teléfono: ${phone}%0A- Email: ${email}%0A%0AGracias.`

      // Determine target phone: prefer explicit prop, otherwise try env NEXT_PUBLIC_WHATSAPP_NUMBER
      const rawTarget = phoneTo || (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string | undefined)
      // Sanitize: remove non-digit characters and leading +
      const target = rawTarget ? rawTarget.replace(/\D/g, "") : null

      const base = target ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(target)}&text=` : `https://api.whatsapp.com/send?text=`
      const url = `${base}${message}`

      // Open in new tab
      window.open(url, "_blank")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center px-4 py-2 border border-emerald-600 text-emerald-600 bg-white rounded-full text-sm font-medium shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
    >
      {loading ? "Abriendo WhatsApp..." : "Reservar"}
    </button>
  )
}
