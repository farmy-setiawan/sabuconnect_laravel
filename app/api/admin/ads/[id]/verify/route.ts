import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

// POST - Verify payment or confirm COD
export async function POST(request: NextRequest, { params }: Params) {
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
    const { action, status } = body // action: 'verify' or 'confirm_cod', status: 'PAID' or 'REJECTED'

    // Call Laravel API to verify payment
    const adRes = await apiFetch<{ data: any }>(`/admin/ads/${id}/verify`, {
      method: 'POST',
      token,
      body: JSON.stringify({ action, status }),
    })

    return NextResponse.json(adRes.data)
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat verifikasi pembayaran' },
      { status: 500 }
    )
  }
}
