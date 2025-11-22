"use client"

import Link from "next/link"
import { User, Home, Tag, AtSign, Lock, LogOut, ChevronRight } from "lucide-react"
import SignOutButton from "@/components/signout-button"

export default function ProfileMenu() {
  const MenuItem = ({ icon: Icon, label, onClick, href, badge, disabled }: { icon: any; label: string; onClick?: () => void; href?: string; badge?: string; disabled?: boolean }) => {
    const content = (
      <div className="flex items-center justify-between px-0 py-5">
        <div className="flex items-center gap-4 px-4">
          <Icon className="w-5 h-5 text-gray-500" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{label}</div>
            {badge ? <div className="mt-0.5 text-xs font-light text-gray-300 opacity-40">{badge}</div> : null}
          </div>
        </div>
        <div className="flex items-center gap-3 pr-4">
          {/* Only show chevron when the item is interactive */}
          {!disabled && (href || onClick) ? <ChevronRight className="w-4 h-4 text-gray-300" /> : null}
        </div>
      </div>
    )

    // When disabled, render plain content (no link/button) to avoid interaction
    if (disabled) return content

    if (href) {
      return (
        <Link href={href} className="block">{content}</Link>
      )
    }

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className="w-full text-left">{content}</button>
      )
    }

    return content
  }

  return (
    <div className="bg-transparent">
      <div className="space-y-2">
        <MenuItem icon={User} label="Información personal" href="/cuenta/perfil/informacion" />
        <MenuItem icon={Home} label="Direcciones guardadas" href="/cuenta/perfil/direcciones" />
        <MenuItem icon={Tag} label="Preferencias de talla" href="/cuenta/perfil/tallas" />
        <MenuItem icon={AtSign} label="Preferencias y redes" badge="PRÓXIMAMENTE" disabled />
        <MenuItem icon={Lock} label="Resetear contraseña" href="/cuenta/perfil/reset-password" />
        <div className="px-4 py-3">
          <SignOutButton label="Cerrar sesión" className="w-full text-left text-sm text-red-600" />
        </div>
      </div>
    </div>
  )
}
