import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Get ad details
export async function GET(request: Request, { params }: Params) {
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

    const { id } = await params

    // Call Laravel API to get ad
    const adRes = await apiFetch<{ data: any }>(`/admin/ads/${id}`, { token })
    const ad = adRes.data

    if (!ad) {
      return NextResponse.json(
        { error: 'Iklan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(ad)
  } catch (error: any) {
    console.error('Error fetching ad:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengambil data iklan' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject ad
export async function PATCH(request: NextRequest, { params }: Params) {
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

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' or 'reject'

    let status = ''
    if (action === 'approve') {
      status = 'WAITING_PAYMENT'
    } else if (action === 'reject') {
      status = 'REJECTED'
    } else {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      )
    }

    // Call Laravel API to update ad
    const adRes = await apiFetch<{ data: any }>(`/admin/ads/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    })

    return NextResponse.json(adRes.data)
  } catch (error: any) {
    console.error('Error updating ad:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memperbarui iklan' },
      { status: 500 }
    )
  }
}
