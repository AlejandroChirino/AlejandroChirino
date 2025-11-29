"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Home, Tag, AtSign, Lock, LogOut, ChevronRight } from "lucide-react"
import SignOutButton from "@/components/signout-button"
import { createBrowserClient } from "@/lib/supabase/client"

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

  function AdminLinkPlaceholder() {
    const [role, setRole] = useState<string | null>(null)
    const [checking, setChecking] = useState(false)
    const router = useRouter()

    useEffect(() => {
      let mounted = true
      const supabase = createBrowserClient()

      supabase.auth.getUser().then(({ data }) => {
        const user = data?.user
        if (!user) return
        supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (!mounted) return
            setRole((profile as any)?.role ?? null)
          })
      })

      return () => { mounted = false }
    }, [])

    if (role !== "admin") return null

    const handleEnterAdmin = async () => {
      if (checking) return
      setChecking(true)
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!user) {
          router.replace('/cuenta')
          return
        }

        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).maybeSingle()
        if ((profile as any)?.role !== 'admin') {
          router.push('/')
          return
        }

        // Try to find the localStorage key used by Supabase and send it to server to set cookie
        const keys = Object.keys(localStorage)
        const tokenKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
        if (tokenKey) {
          const tokenValue = localStorage.getItem(tokenKey)
          try {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: tokenKey, value: tokenValue }),
            })
            // After server sets cookie, navigate to /admin — middleware should now see the cookie
            router.push('/admin')
            return
          } catch (err) {
            // fallback to direct navigation
          }
        }

        // If we couldn't sync cookie, still attempt navigation — middleware may redirect to /cuenta
        router.push('/admin')
      } finally {
        setChecking(false)
      }
    }

    return <MenuItem icon={Tag} label={checking ? 'Accediendo...' : 'Acceder al panel'} onClick={handleEnterAdmin} />
  }

  return (
    <div className="bg-transparent">
      <div className="space-y-2">
        <MenuItem icon={User} label="Información personal" href="/cuenta/perfil/informacion" />
        <MenuItem icon={Home} label="Direcciones guardadas" href="/cuenta/perfil/direcciones" />
        <MenuItem icon={Tag} label="Preferencias de talla" href="/cuenta/perfil/tallas" />
        <MenuItem icon={AtSign} label="Preferencias y redes" badge="PRÓXIMAMENTE" disabled />
        <MenuItem icon={Lock} label="Resetear contraseña" href="/cuenta/perfil/reset-password" />
        {/* Mostrar enlace al panel admin solo si el perfil del usuario tiene role === 'admin' */}
        {typeof window !== 'undefined' ? (
          <AdminLinkPlaceholder />
        ) : null}
        <div className="px-4 py-3">
          <SignOutButton label="Cerrar sesión" className="w-full text-left text-sm text-red-600" />
        </div>
      </div>
    </div>
  )
}

