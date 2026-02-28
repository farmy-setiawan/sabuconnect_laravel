import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAdminUsers, apiFetch } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET all users (with pagination and filters)
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = (session as any).token
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const response = await getAdminUsers(token)
    return NextResponse.json({
      users: response.data || [],
      pagination: {
        page: 1,
        limit: 10,
        total: response.data?.length || 0,
        totalPages: 1,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: Request) {
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
    const user = await apiFetch<{ data: any }>('/admin/users', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 })
  }
}
