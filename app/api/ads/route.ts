import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAds, createAd } from '@/lib/api'

// GET - Fetch ads for provider
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
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

    const response = await getAds(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data iklan' },
      { status: 500 }
    )
  }
}

// POST - Create new ad
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
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
    const ad = await createAd(token, body)

    return NextResponse.json(ad.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat iklan' },
      { status: 500 }
    )
  }
}
