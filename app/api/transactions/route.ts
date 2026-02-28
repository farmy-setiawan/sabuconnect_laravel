import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTransactions, createTransaction } from '@/lib/api'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
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

    const response = await getTransactions(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data transaksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
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
    const { listingId, paymentMethod, notes, amount } = body

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'Listing dan jumlah wajib diisi' },
        { status: 400 }
      )
    }

    const transaction = await createTransaction(token, {
      listing_id: listingId,
      payment_method: paymentMethod || null,
      notes: notes || null,
      amount: parseFloat(amount),
    })

    return NextResponse.json(transaction.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat transaksi' },
      { status: 500 }
    )
  }
}
