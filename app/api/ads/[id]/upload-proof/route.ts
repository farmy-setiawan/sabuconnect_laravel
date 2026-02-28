import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

// POST - Upload payment proof
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'PROVIDER') {
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
    const { proofImage } = body

    // Call Laravel API to get the ad
    const adRes = await apiFetch<{ data: any }>(`/ads/${id}`, { token })
    const ad = adRes.data

    if (!ad) {
      return NextResponse.json(
        { error: 'Iklan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (ad.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if ad is in WAITING_PAYMENT status
    if (ad.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Iklan tidak dalam status menunggu pembayaran' },
        { status: 400 }
      )
    }

    // Check if payment method is TRANSFER
    if (ad.paymentMethod !== 'TRANSFER') {
      return NextResponse.json(
        { error: 'Metode pembayaran bukan transfer' },
        { status: 400 }
      )
    }

    // Call Laravel API to upload payment proof
    const payment = await apiFetch<{ data: any }>(`/ads/${id}/upload-proof`, {
      method: 'POST',
      token,
      body: JSON.stringify({ proofImage }),
    })

    return NextResponse.json(payment.data)
  } catch (error: any) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat upload bukti transfer' },
      { status: 500 }
    )
  }
}
