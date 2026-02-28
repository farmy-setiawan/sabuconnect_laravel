import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAds, createAd } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

// GET - Fetch advertisements
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

    const response = await getAds(token)
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil iklan' },
      { status: 500 }
    )
  }
}

// POST - Create new advertisement
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
    const advertisement = await createAd(token, body)

    return NextResponse.json(advertisement.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating advertisement:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat iklan' },
      { status: 500 }
    )
  }
}
