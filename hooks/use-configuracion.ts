"use client"

import { useState, useEffect } from "react"
import type { ConfiguracionData } from "@/lib/admin-types"

export function useConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionData>({
    precio_libra: 0,
    valor_dolar: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/admin/configuracion")

      if (!res.ok) {
        throw new Error(`Error al cargar configuración: ${res.status}`)
      }

      const data = await res.json()

      if (data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("Error loading config:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (newConfig: Partial<ConfiguracionData>) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConfig),
      })

      if (!res.ok) {
        throw new Error(`Error al actualizar configuración: ${res.status}`)
      }

      const data = await res.json()

      if (data.config) {
        setConfig(data.config)
        return { success: true }
      }

      return { success: false, error: "No se recibió la configuración actualizada" }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("Error updating config:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  return {
    config,
    loading,
    error,
    updateConfig,
    reloadConfig: loadConfig,
  }
}
