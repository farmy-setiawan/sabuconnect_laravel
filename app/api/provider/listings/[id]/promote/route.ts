import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

const PROMOTION_PRICE_PER_DAY = 1000

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    if (session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { days, method } = body

    if (!days || days < 1) {
      return NextResponse.json({ error: 'Jumlah hari harus minimal 1' }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = days * PROMOTION_PRICE_PER_DAY

    // Call Laravel API to promote listing
    const result = await apiFetch<{
      success: boolean;
      message: string;
      payment?: {
        id: string;
        amount: number;
        method: string;
        status: string;
      }
    }>(`/provider/listings/${params.id}/promote`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        days,
        method,
        amount: totalPrice,
      }),
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error promoting listing:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
