import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Ping diario a Supabase para que el proyecto (plan gratis) no se pause
// por inactividad. Lo dispara el Vercel Cron definido en vercel.json.
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  // Si CRON_SECRET está configurado en Vercel, el cron lo manda como
  // "Authorization: Bearer <CRON_SECRET>" y rechazamos cualquier otra llamada.
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { error } = await supabase.from("courses").select("id").limit(1)
  if (error) {
    console.error("Supabase keepalive failed:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
