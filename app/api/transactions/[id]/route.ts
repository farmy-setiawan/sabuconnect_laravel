import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, paymentMethod } = body

    // Call Laravel API to get the transaction first
    const transactionRes = await apiFetch<{ data: any }>(`/transactions/${params.id}`, {
      token,
    })

    if (!transactionRes.data) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const transaction = transactionRes.data

    // Check if user is authorized to update this transaction
    const isProvider = session.user.role === 'PROVIDER' && transaction.providerId === session.user.id
    const isCustomer = session.user.role === 'USER' && transaction.customerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (!validTransitions[transaction.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Tidak dapat mengubah status dari ${transaction.status} ke ${status}` },
        { status: 400 }
      )
    }

    // Call Laravel API to update transaction
    const updatedTransaction = await apiFetch<{ data: any }>(`/transactions/${params.id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ status, paymentMethod }),
    })

    return NextResponse.json(updatedTransaction.data)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memperbarui transaksi' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Call Laravel API to get the transaction
    const transactionRes = await apiFetch<{ data: any }>(`/transactions/${params.id}`, {
      token,
    })

    const transaction = transactionRes.data

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user is authorized to view this transaction
    const isProvider = session.user.role === 'PROVIDER' && transaction.providerId === session.user.id
    const isCustomer = session.user.role === 'USER' && transaction.customerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengambil transaksi' },
      { status: 500 }
    )
  }
}
