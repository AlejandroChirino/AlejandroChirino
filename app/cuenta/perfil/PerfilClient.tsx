"use client"

import { useEffect, useState, useRef } from "react"
import ProfileEditor from "@/components/profile-editor"
import ProfileHeader from "@/components/profile-header"
import ProfileMenu from "@/components/profile-menu"

export default function PerfilClient({ name, email }: { name?: string; email?: string }) {
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
