import { supabase } from "./supabaseClient"
import { getSupabaseAdmin } from "./supabaseAdmin"

// Nombre de tablas públicas según nuestro esquema
export type PublicTable = keyof import("./database.types").Database["public"]["Tables"]

// Wrapper tipado para el cliente público
export const db = {
  from<T extends PublicTable>(table: T) {
    return supabase.from(table)
  },
}

// Wrapper tipado para el cliente de servidor (service role)
export const dbAdmin = {
  from<T extends PublicTable>(table: T) {
    return getSupabaseAdmin().from(table)
  },
}
