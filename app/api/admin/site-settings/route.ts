import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSiteSettings, updateSiteSettings } from '@/lib/api'

export const dynamic = 'force-dynamic'

// Get site settings
export async function GET() {
  try {
    const response = await getSiteSettings()
    return NextResponse.json(response.data || {
      id: 'site_settings',
      logo: null,
      siteName: 'SABUConnect',
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    )
  }
}

// Update site settings (admin only)
export async function PUT(request: Request) {
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
    const settings = await updateSiteSettings(token, body)

    return NextResponse.json(settings.data)
  } catch (error: any) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengupdate pengaturan' },
      { status: 500 }
    )
  }
}
