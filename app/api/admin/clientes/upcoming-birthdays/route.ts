import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams
    const days = Number(params.get("days") || "5")

    let admin: any
    try {
      admin = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
    }
    const { data: profiles, error } = await admin.from("user_profiles").select("id,full_name,email,birthdate")
    if (error) {
      console.error("Error fetching profiles for birthdays:", error)
      return NextResponse.json({ error: "Error" }, { status: 500 })
    }

    const now = new Date()
    const upcoming: any[] = []
    for (const p of profiles || []) {
      if (!p.birthdate) continue
      const b = new Date(p.birthdate)
      const thisYear = new Date(now.getFullYear(), b.getMonth(), b.getDate())
      let diff = Math.ceil((thisYear.getTime() - now.getTime()) / (1000*60*60*24))
      if (diff < 0) {
        // birthday has passed this year, check next year
        const nextYear = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate())
        diff = Math.ceil((nextYear.getTime() - now.getTime()) / (1000*60*60*24))
      }
      if (diff >= 0 && diff <= days) {
        upcoming.push({ id: p.id, full_name: p.full_name, email: p.email, birthdate: p.birthdate, daysUntil: diff })
      }
    }

    upcoming.sort((a,b) => a.daysUntil - b.daysUntil)
    return NextResponse.json({ upcoming })
  } catch (err: any) {
    console.error("Error in GET /api/admin/clientes/upcoming-birthdays:", err)
    return NextResponse.json({ error: "Internal error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}
