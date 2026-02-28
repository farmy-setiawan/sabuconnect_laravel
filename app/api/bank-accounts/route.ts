import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBankAccounts, createBankAccount } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
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

    const response = await getBankAccounts(token)
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
    const bankAccount = await createBankAccount(token, body)

    return NextResponse.json(bankAccount.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bank account:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat rekening' },
      { status: 500 }
    )
  }
}
