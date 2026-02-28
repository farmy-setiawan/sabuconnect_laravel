import { NextResponse } from 'next/server'
import { getVillages } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour (villages don't change often)

// GET villages with optional search and district filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get('district')
    const search = searchParams.get('search')

    // Build query params
    const params: Record<string, string> = {}
    if (district) params.district = district
    if (search) params.search = search

    const response = await getVillages()
    let villages = response.data || []

    // Group villages by district for better UX
    const grouped: Record<string, { id: string; name: string; district: string }[]> = {}
    
    for (const village of villages) {
      if (!grouped[village.district]) {
        grouped[village.district] = []
      }
      grouped[village.district].push({
        id: village.id,
        name: village.name,
        district: village.district,
      })
    }

    return NextResponse.json({
      villages,
      grouped,
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}
