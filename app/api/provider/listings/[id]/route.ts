import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateListing, deleteListing, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Params) {
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

    const { id } = await params
    const body = await request.json()
    
    const listing = await updateListing(token, id, body)

    return NextResponse.json(listing.data)
  } catch (error: any) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memperbarui listing' },
      { status: 500 }
    )
  }
}

// DELETE handler for removing a listing
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const { id } = await params

    await deleteListing(token, id)

    return NextResponse.json({ 
      success: true, 
      message: 'Listing berhasil dihapus' 
    })
  } catch (error: any) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghapus listing' },
      { status: 500 }
    )
  }
}
