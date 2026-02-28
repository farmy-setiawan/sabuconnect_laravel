import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCategories, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    const response = await getCategories()
    return NextResponse.json(response.data || [])
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kategori' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya admin yang dapat membuat kategori' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, parentId } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan tipe kategori wajib diisi' },
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

    const category = await apiFetch<{ data: any }>('/admin/categories', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        type,
        parent_id: parentId || null,
      }),
    })

    return NextResponse.json(category.data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat kategori' },
      { status: 500 }
    )
  }
}
