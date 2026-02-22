import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Authentication is currently disabled - all routes are public
  // When authentication is needed, restore the Supabase client creation
  // and uncomment the auth check below
  return NextResponse.next({ request })
}
