import { NextResponse } from 'next/server'
import { getPromoBanners } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || 'hero'
    
    // Laravel will handle the date filtering
    const response = await getPromoBanners()
    const banners = response.data || []

    // Filter by position on client side since Laravel might not have this filter
    const filteredBanners = banners.filter((banner: any) => 
      banner.position === position && banner.is_active
    )

    return NextResponse.json(filteredBanners)
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
