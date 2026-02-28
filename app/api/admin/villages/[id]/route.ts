import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

// GET single village by ID
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Desa tidak ditemukan' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching village:', error)
    return NextResponse.json({ error: 'Gagal mengambil data desa' }, { status: 500 })
  }
}

// PUT update village
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const body = await request.json()
    const village = await apiFetch<{ data: any }>(`/admin/villages/${params.id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(village.data)
  } catch (error: any) {
    console.error('Error updating village:', error)
    return NextResponse.json({ error: error.message || 'Gagal mengupdate data desa' }, { status: 500 })
  }
}

// DELETE village
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    await apiFetch<{ message: string }>(`/admin/villages/${params.id}`, {
      method: 'DELETE',
      token,
    })

    return NextResponse.json({ message: 'Desa berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting village:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus data desa' }, { status: 500 })
  }
}
