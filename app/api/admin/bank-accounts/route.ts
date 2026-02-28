import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAdminBankAccounts, apiFetch } from '@/lib/api'

export async function GET() {
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

    const response = await getAdminBankAccounts(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}

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
    const bankAccount = await apiFetch<{ data: any }>('/admin/bank-accounts', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(bankAccount.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bank account:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat rekening' },
      { status: 500 }
    )
  }
}
