import { NextResponse } from 'next/server'
import { getListings, getCategories, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

// GET /api/stats - Get statistics for homepage
export async function GET() {
  try {
    // Fetch from Laravel API
    const [listingsRes, categoriesRes] = await Promise.all([
      getListings({ status: 'ACTIVE' }),
      getCategories(),
    ])

    const activeListingsCount = listingsRes.data?.length || 0
    const categoryCount = categoriesRes.data?.length || 0

    // Note: For total users and providers, we need admin endpoint
    // For now, return placeholder values
    return NextResponse.json({
      providers: 0, // Would need admin endpoint
      activeListings: activeListingsCount,
      users: 0, // Would need admin endpoint
      categories: categoryCount,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        providers: 0,
        activeListings: 0,
        users: 0,
        categories: 0,
      },
      { status: 500 }
    )
  }
}
