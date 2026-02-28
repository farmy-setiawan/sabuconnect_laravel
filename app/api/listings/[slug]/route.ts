import { NextRequest, NextResponse } from 'next/server'
import { getListingBySlug, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const response = await getListingBySlug(slug)

    if (!response.data) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil listing' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Laravel should handle incrementing views
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
