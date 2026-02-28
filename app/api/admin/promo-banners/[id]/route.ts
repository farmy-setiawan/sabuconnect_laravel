import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

// GET single promo banner
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    // Note: Laravel might not have a GET single endpoint, return empty for now
    return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching promo banner:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PUT update promo banner
export async function PUT(
  request: Request,
  { params }: Params
) {
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
    const banner = await apiFetch<{ data: any }>(`/admin/promo-banners/${params.id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(banner.data)
  } catch (error: any) {
    console.error('Error updating promo banner:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE promo banner
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    await apiFetch<{ message: string }>(`/admin/promo-banners/${params.id}`, {
      method: 'DELETE',
      token,
    })

    return NextResponse.json({ message: 'Banner berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting promo banner:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
