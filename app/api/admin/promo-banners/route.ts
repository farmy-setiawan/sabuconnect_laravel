import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAdminPromoBanners, createAdminPromoBanner } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET all promo banners (admin)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const response = await getAdminPromoBanners(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST create new promo banner
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const body = await request.json()
    const banner = await createAdminPromoBanner(token, body)

    return NextResponse.json(banner.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
