import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getListings, createListing } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Convert Next.js params to Laravel params
    const params: Record<string, string> = {}
    if (searchParams.get('q')) params.q = searchParams.get('q')!
    if (searchParams.get('categoryId')) params.categoryId = searchParams.get('categoryId')!
    if (searchParams.get('type')) params.type = searchParams.get('type')!
    if (searchParams.get('location')) params.location = searchParams.get('location')!
    if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice')!
    if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice')!
    if (searchParams.get('userId')) params.userId = searchParams.get('userId')!
    if (searchParams.get('status')) params.status = searchParams.get('status')!
    if (searchParams.get('sortBy')) params.sortBy = searchParams.get('sortBy')!
    if (searchParams.get('page')) params.page = searchParams.get('page')!
    if (searchParams.get('limit')) params.limit = searchParams.get('limit')!
    if (searchParams.get('isFeatured')) params.isFeatured = searchParams.get('isFeatured')!

    const response = await getListings(params)
    
    return NextResponse.json({
      listings: response.data,
      pagination: {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '12'),
        total: response.data?.length || 0,
        totalPages: Math.ceil((response.data?.length || 0) / 12),
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya provider yang dapat membuat listing' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, price, priceType, images, location, phone, categoryId } = body

    if (!title || !description || !price || !location || !phone || !categoryId) {
      return NextResponse.json(
        { error: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      )
    }

    // Get token from session
    const token = (session as any).token
    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const listing = await createListing(token, {
      title,
      description,
      price: parseFloat(price),
      price_type: priceType || 'FIXED',
      images: images || [],
      location,
      phone,
      category_id: categoryId,
    })

    return NextResponse.json(listing.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat listing' },
      { status: 500 }
    )
  }
}
