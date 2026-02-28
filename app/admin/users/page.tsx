import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UsersClient } from './UsersClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface SearchParams {
  search?: string
  role?: string
}

interface UserData {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  isVerified: boolean
  createdAt: string
  _count: {
    listings: number
  }
}

async function getAllUsers(search?: string, role?: string): Promise<UserData[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    params.set('limit', '50')

    const res = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

async function getStats() {
  try {
    const res = await fetch(`${API_URL}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return { total: 0, admins: 0, providers: 0, users: 0, unverified: 0 }
    }

    const data = await res.json()
    return {
      total: data.users || 0,
      admins: data.admins || 0,
      providers: data.providers || 0,
      users: data.regularUsers || 0,
      unverified: data.unverifiedUsers || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, admins: 0, providers: 0, users: 0, unverified: 0 }
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const [users, stats] = await Promise.all([
    getAllUsers(params.search, params.role),
    getStats(),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <UsersClient initialUsers={users as any} stats={stats as any} />
      <Footer />
    </div>
  )
}
