// Utilities para convertir subcategoría <-> slug
import { SUBCATEGORIAS } from "./types"

export function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function labelFromSlug(categoryKey: keyof typeof SUBCATEGORIAS, slug: string): string | null {
  if (!slug) return null
  const list = SUBCATEGORIAS[categoryKey] || []

  // Try exact slug match first (expected case)
  const found = list.find((label) => slugifyLabel(label) === slug)
  if (found) return found

  // Fallback: be tolerant to callers that pass raw labels (with spaces/accents)
  // Normalize both sides (remove diacritics, lower-case, collapse whitespace)
  const normalizeForCompare = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[-\s]+/g, " ")
      .trim()

  const target = normalizeForCompare(slug.replace(/-/g, " "))
  const byNormalized = list.find((label) => normalizeForCompare(label) === target)
  return byNormalized ?? null
}

export function slugFromLabel(categoryKey: keyof typeof SUBCATEGORIAS, label: string): string {
  return slugifyLabel(label)
}

export default {
  slugifyLabel,
  labelFromSlug,
  slugFromLabel,
}
