import { supabase } from "./supabaseClient"
import { getAdminDb } from "./adminClient"

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
    // Prefer the admin helper which will return a session-aware client when
    // appropriate or fall back to service-role client only when explicitly allowed.
    return getAdminDb().then((db) => db.from(table))
  },
}
