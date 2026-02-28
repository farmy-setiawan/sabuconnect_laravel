import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateAdminListingStatus, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()

    // Check if user is admin
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

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const listing = await updateAdminListingStatus(token, id, status)

    return NextResponse.json(listing.data)
  } catch (error: any) {
    console.error('Error updating listing status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update listing status' },
      { status: 500 }
    )
  }
}
