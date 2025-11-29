"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import ProfileEditor from "@/components/profile-editor"
import ProfileHeader from "@/components/profile-header"
import ProfileMenu from "@/components/profile-menu"
import { createBrowserClient } from "@/lib/supabase/client"

export default function PerfilClient() {
  // Local-only UI state (no backend persistence here)
  const [phone, setPhone] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState({ label: "Casa", line1: "", line2: "", city: "", state: "", postal: "", country: "" })
  const [sizes, setSizes] = useState({ camisa: "", pantalon: "", calzado: "" })
  const [contactMethod, setContactMethod] = useState("whatsapp")
  const [birthdate, setBirthdate] = useState("")
  const [gender, setGender] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [labelOpen, setLabelOpen] = useState(false)
  const labelRef = useRef<HTMLDivElement | null>(null)
  const [name, setName] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load any saved UI state from localStorage so the form isn't empty during demo
    try {
      const raw = localStorage.getItem("perfil_ui")
      if (raw) {
        const parsed = JSON.parse(raw)
        setPhone(parsed.phone || "")
        setPhoneVerified(Boolean(parsed.phoneVerified))
        setAddresses(parsed.addresses || [])
        setSizes(parsed.sizes || { camisa: "", pantalon: "", calzado: "" })
        setContactMethod(parsed.contactMethod || "whatsapp")
        setBirthdate(parsed.birthdate || "")
        setGender(parsed.gender || "")
        setInstagram(parsed.instagram || "")
        setFacebook(parsed.facebook || "")
        setWhatsapp(parsed.whatsapp || "")
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const supabase = createBrowserClient()

    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user
      if (!user) {
        // not authenticated client-side -> redirect to /cuenta
        router.replace('/cuenta')
        return
      }

      supabase.from('user_profiles').select('full_name, email').eq('id', user.id).maybeSingle().then(({ data: profile }) => {
        if (!mounted) return
        setName((profile as any)?.full_name ?? (user as any)?.email ?? undefined)
        setEmail((profile as any)?.email ?? (user as any)?.email ?? undefined)
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setName((user as any)?.email ?? undefined)
        setEmail((user as any)?.email ?? undefined)
        setLoading(false)
      })
    }).catch(() => {
      if (mounted) router.replace('/cuenta')
    })

    return () => { mounted = false }
  }, [router])

  const handleSaveLocal = () => {
    const payload = { phone, phoneVerified, addresses, sizes, contactMethod, birthdate, gender, instagram, facebook, whatsapp }
    localStorage.setItem("perfil_ui", JSON.stringify(payload))
    alert("Perfil guardado localmente (demo)")
  }

  const addAddress = () => {
    setAddresses((prev) => [...prev, { ...newAddress }])
    setNewAddress({ label: "Casa", line1: "", line2: "", city: "", state: "", postal: "", country: "" })
  }

  // close label dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (labelRef.current && !labelRef.current.contains(e.target as Node)) {
        setLabelOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-8 px-4">
        <ProfileHeader name={name} email={email} />

        <div className="pt-4">
          <ProfileMenu />
        </div>

        {/* botones removidos según petición de diseño ultra-minimalista */}
      </div>
    </div>
  )
}
