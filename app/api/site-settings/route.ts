import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    const response = await getSiteSettings()
    
    // Return default if not exists
    if (!response.data) {
      return NextResponse.json({
        id: 'site_settings',
        logo: null,
        siteName: 'SABUConnect',
      })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    )
  }
}
