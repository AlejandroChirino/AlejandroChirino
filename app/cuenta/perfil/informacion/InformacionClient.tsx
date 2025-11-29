"use client"

import React, { useEffect, useRef, useState } from "react"
import { Check, User, Mail, Smartphone, Calendar, HelpCircle, Edit, ChevronDown, MapPin } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function InformacionClient({ initialName, initialEmail, initialPhone, initialBirthdate, initialGender, initialAddress }: { initialName?: string; initialEmail?: string; initialPhone?: string; initialBirthdate?: string; initialGender?: string; initialAddress?: string }) {
  const supabase = createBrowserClient()
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // split name into first + last for UI. If only one token, lastName stays empty
  // Split initialName so that the LAST token becomes the last name
  // e.g. "Juan Carlos Perez" -> firstName: "Juan Carlos", lastName: "Perez"
  const tokens = (initialName ?? "").trim().split(/\s+/).filter(Boolean)
  // Rule: if there are 3 or more tokens, take the last TWO tokens as last name
  // Examples:
  // - "jose alejandro chirino torres" -> first: "jose alejandro", last: "chirino torres"
  // - "jose chirino torres" -> first: "jose", last: "chirino torres"
  // - "jose chirino" -> first: "jose", last: "chirino"
  let inferredFirst = ""
  let inferredLast = ""
  if (tokens.length === 0) {
    inferredFirst = ""
    inferredLast = ""
  } else if (tokens.length === 1) {
    inferredFirst = tokens[0]
    inferredLast = ""
  } else if (tokens.length === 2) {
    inferredFirst = tokens[0]
    inferredLast = tokens[1]
  } else {
    inferredLast = tokens.slice(-2).join(" ")
    inferredFirst = tokens.slice(0, tokens.length - 2).join(" ")
  }
  const [firstName, setFirstName] = useState(inferredFirst)
  const [lastName, setLastName] = useState(inferredLast)
  const [birthdate, setBirthdate] = useState<string>(initialBirthdate ?? "")
  // normalize/translate gender values to Spanish for display and saving
  const mapGenderToSpanish = (g?: string | null) => {
    if (!g) return ""
    const v = String(g).toLowerCase()
    if (["male", "m", "man", "hombre"].includes(v)) return "hombre"
    if (["female", "f", "woman", "mujer"].includes(v)) return "mujer"
    if (["nonbinary", "non-binary", "non binary", "nb", "no_binario", "no binario", "nonbinary"].includes(v)) return "no binario"
    if (["other", "otro"].includes(v)) return "otro"
    return v
  }

  const [gender, setGender] = useState<string>(mapGenderToSpanish(initialGender ?? ""))
  const [genderOpen, setGenderOpen] = useState(false)
  const genderRef = useRef<HTMLDivElement | null>(null)
  const [missingColsSQL, setMissingColsSQL] = useState<string | null>(null)
  const [phone, setPhone] = useState<string>(initialPhone ?? "")
  const [address, setAddress] = useState<string>(initialAddress ?? "")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("perfil_extra")
      if (raw) {
        const parsed = JSON.parse(raw)
        // prefer server values if present; otherwise take from local storage
        if (!birthdate) setBirthdate(parsed.birthdate ?? "")
        if (!gender) setGender(mapGenderToSpanish(parsed.gender ?? ""))
        if (!phone) setPhone(parsed.phone ?? (initialPhone ?? ""))
        if (!address) setAddress(parsed.address ?? (initialAddress ?? ""))
      }
    } catch (e) {}
  }, [])

  // close gender popover when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!genderRef.current) return
      if (!genderRef.current.contains(e.target as Node)) setGenderOpen(false)
    }
    if (genderOpen) document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [genderOpen])

  const handleSave = async () => {
    setSaving(true)
    try {
      const first_name = (firstName || null)
      const last_name = (lastName || null)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        toast({ title: "No autenticado", description: "Inicia sesión para editar tu perfil.", variant: "destructive" })
        setSaving(false)
        return
      }

      const updatePayload: any = {}
      if (first_name !== null) updatePayload.first_name = first_name
      if (last_name !== null) updatePayload.last_name = last_name
      if (phone) updatePayload.phone = phone
      if (address) updatePayload.address = address
      if (birthdate) updatePayload.birthdate = birthdate
      if (gender) updatePayload.gender = gender

      const { error } = await supabase.from("user_profiles").update(updatePayload).eq("id", user.id)

      if (error) {
        const msg = (error as any).message ?? String(error)
        const missing: string[] = []
        if (/first_name/.test(msg)) missing.push("first_name")
        if (/last_name/.test(msg)) missing.push("last_name")
        if (/birthdate/.test(msg)) missing.push("birthdate")
        if (/gender/.test(msg)) missing.push("gender")
        if (/address/.test(msg)) missing.push("address")

          if (missing.length > 0) {
          // fallback: try to update full_name
          try {
            await supabase.from("user_profiles").update({ full_name: [firstName, lastName].filter(Boolean).join(" ") }).eq("id", user.id)
          } catch (e) {}

          const suggestions: string[] = []
          if (missing.includes("first_name")) suggestions.push("ALTER TABLE public.user_profiles ADD COLUMN first_name character varying;")
          if (missing.includes("last_name")) suggestions.push("ALTER TABLE public.user_profiles ADD COLUMN last_name character varying;")
          if (missing.includes("birthdate")) suggestions.push("ALTER TABLE public.user_profiles ADD COLUMN birthdate date;")
          if (missing.includes("gender")) suggestions.push("ALTER TABLE public.user_profiles ADD COLUMN gender text;")
          if (missing.includes("address")) suggestions.push("ALTER TABLE public.user_profiles ADD COLUMN address text;")

          setMissingColsSQL(suggestions.join("\n"))
          throw new Error("Algunas columnas no existen en la tabla user_profiles. Revisa las sentencias SQL sugeridas.")
        }

        throw error
      }

      try {
        localStorage.setItem("perfil_extra", JSON.stringify({ birthdate, gender, phone, address }))
      } catch (e) {}

      toast({ title: "Guardado", description: "Tus cambios se han guardado.", variant: "default" })
    } catch (e: any) {
      console.error(e)
      toast({ title: "Error", description: e?.message ?? "No se pudo guardar", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Main title + edit icon */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">INFORMACIÓN PERSONAL</h2>
        <button
          onClick={() => {
            if (editMode) {
                      // cancel edit: reset fields to initial
                      setFirstName(inferredFirst)
                      setLastName(inferredLast)
                      setPhone(initialPhone ?? "")
                      setAddress(initialAddress ?? "")
                      setBirthdate(initialBirthdate ?? "")
                      setGender(mapGenderToSpanish(initialGender ?? ""))
                    }
            setEditMode(!editMode)
          }}
          aria-label={editMode ? "Cerrar edición" : "Editar perfil"}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Mis Datos: display rows with icons */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><User className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Nombre completo</div>
            <div className="text-sm font-semibold text-gray-900">{[firstName, lastName].filter(Boolean).join(' ') || initialName || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><Mail className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Email</div>
            <div className="text-sm font-semibold text-gray-900">{initialEmail || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><Smartphone className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Teléfono</div>
            <div className="text-sm font-semibold text-gray-900">{phone || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><MapPin className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Dirección</div>
            <div className="text-sm font-semibold text-gray-900">{address || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><Calendar className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Fecha de nacimiento</div>
            <div className="text-sm font-semibold text-gray-900">{birthdate || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-gray-500 mt-1"><HelpCircle className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400">Género</div>
            <div className="text-sm font-semibold text-gray-900">{gender || '—'}</div>
          </div>
        </div>
      </div>

      {/* Edit form: hidden by default, shown when editMode is true */}
      {editMode && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="mt-8 border-t border-gray-100 pt-6">
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Nombre"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Apellido</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Apellido"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="+58 0414 123 4567"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Dirección</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Dirección, ciudad, estado"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Fecha de nacimiento</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
          />
        </div>

        <div className="mb-6" ref={genderRef}>
          <label className="block text-sm text-gray-400 mb-2">Género (opcional)</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setGenderOpen(!genderOpen)}
              aria-haspopup="listbox"
              aria-expanded={genderOpen}
              className="w-full text-left bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2 flex items-center justify-between"
            >
              <span className="text-sm font-semibold text-gray-900">{gender || 'Prefiero no decir'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {genderOpen && (
              <div className="absolute left-0 mt-2 w-full z-50 bg-white rounded-md shadow-sm border border-gray-100">
                <div className="py-1">
                  {[
                    { value: "", label: "Prefiero no decir" },
                    { value: "hombre", label: "Hombre" },
                    { value: "mujer", label: "Mujer" },
                    { value: "no binario", label: "No binario" },
                    { value: "otro", label: "Otro" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setGender(opt.value); setGenderOpen(false) }}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className="text-green-600">
                        {opt.value === gender && <Check className="w-4 h-4" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* optional: export to CSV/Excel placeholder */}
        <div className="mt-6 flex items-center">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={() => { setEditMode(false); setFirstName(inferredFirst); setLastName(inferredLast); setPhone(initialPhone ?? ""); setAddress(initialAddress ?? ""); setBirthdate(initialBirthdate ?? ""); setGender(mapGenderToSpanish(initialGender ?? "")); }} className="ml-3 px-4 py-2 border rounded-md text-sm">
            Cancelar
          </button>
        </div>
        </form>
      )}

      {missingColsSQL && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <div className="text-sm font-semibold text-yellow-800 mb-2">Columnas faltantes detectadas</div>
          <div className="text-sm text-gray-700 mb-2">Para guardar todos los campos en la base de datos, ejecuta las siguientes sentencias SQL en tu base de datos (p. ej. en Supabase SQL editor):</div>
          <pre className="bg-white p-3 rounded text-sm overflow-auto">{missingColsSQL}</pre>
        </div>
      )}
    </div>
  )
}
