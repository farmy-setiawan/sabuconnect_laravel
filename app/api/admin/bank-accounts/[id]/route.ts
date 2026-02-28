import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
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

    const bankAccount = await apiFetch<{ data: any }>(`/admin/bank-accounts/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(bankAccount.data)
  } catch (error: any) {
    console.error('Error updating bank account:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengupdate rekening' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
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

    await apiFetch<{ success: boolean }>(`/admin/bank-accounts/${id}`, {
      method: 'DELETE',
      token,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting bank account:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghapus rekening' },
      { status: 500 }
    )
  }
}
