import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    if (session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const formData = await request.formData()
    const proof = formData.get('proof') as File | null
    const listingId = formData.get('listingId') as string

    if (!proof) {
      return NextResponse.json({ error: 'Bukti pembayaran wajib diupload' }, { status: 400 })
    }

    if (!listingId) {
      return NextResponse.json({ error: 'ID listing wajib disediakan' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await proof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = proof.type
    
    // Create data URL for storage
    const proofDataUrl = `data:${mimeType};base64,${base64}`

    // Call Laravel API to upload payment proof
    const result = await apiFetch<{ success: boolean; message: string }>(
      '/provider/promotions/upload-proof',
      {
        method: 'POST',
        token,
        body: JSON.stringify({
          proof: proofDataUrl,
          listingId,
        }),
      }
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
