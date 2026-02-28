import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getVillages, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET all villages or create new village
export async function GET(request: Request) {
  try {
    const response = await getVillages()
    return NextResponse.json({
      villages: response.data || [],
      districts: [],
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}

// POST create new village
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const village = await apiFetch<{ data: any }>('/admin/villages', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(village.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating village:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal membuat data desa' },
      { status: 500 }
    )
  }
}
