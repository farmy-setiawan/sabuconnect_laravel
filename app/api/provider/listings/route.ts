import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMyListings } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const response = await getMyListings(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
