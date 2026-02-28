import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Stats {
  users: number
  listings: number
  categories: number
  providers: number
  products: number
  pendingListings: number
  activeListings: number
  activePromotions: number
  pendingPromotions: number
}

async function getStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API_URL}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return {
        users: 0,
        listings: 0,
        categories: 0,
        providers: 0,
        products: 0,
        pendingListings: 0,
        activeListings: 0,
        activePromotions: 0,
        pendingPromotions: 0,
      }
    }

    const data = await res.json()
    return {
      users: data.users || 0,
      listings: data.totalListings || 0,
      categories: data.categories || 0,
      providers: data.providers || 0,
      products: data.products || 0,
      pendingListings: data.pendingListings || 0,
      activeListings: data.activeListings || 0,
      activePromotions: data.activePromotions || 0,
      pendingPromotions: data.pendingPromotions || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      users: 0,
      listings: 0,
      categories: 0,
      providers: 0,
      products: 0,
      pendingListings: 0,
      activeListings: 0,
      activePromotions: 0,
      pendingPromotions: 0,
    }
  }
}

async function getRecentListings() {
  try {
    const res = await fetch(`${API_URL}/admin/listings?limit=5`, {
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
    console.error('Error fetching recent listings:', error)
    return []
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [stats, recentListings] = await Promise.all([
    getStats(),
    getRecentListings(),
  ])

  const menuItems = [
    { 
      href: '/admin/users', 
      label: 'Pengguna', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
      description: 'Kelola data pengguna'
    },
    { 
      href: '/admin/listings', 
      label: 'Listing', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-purple-500',
      description: 'Kelola semua listing'
    },
    { 
      href: '/admin/promotions', 
      label: 'Promosi', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      description: 'Kelola promosi listing'
    },
    { 
      href: '/admin/promo-banners', 
      label: 'Banner', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-pink-500',
      description: 'Kelola banner promo'
    },
    { 
      href: '/admin/settings', 
      label: 'Pengaturan', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-gray-500',
      description: 'Pengaturan sistem'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-secondary">Kelola semua data dan konten</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary">{stats.users}</p>
                <p className="text-sm text-text-secondary">Total Pengguna</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary">{stats.listings}</p>
                <p className="text-sm text-text-secondary">Total Listing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingListings}</p>
                <p className="text-sm text-text-secondary">Menunggu Verifikasi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-600">{stats.activeListings}</p>
                <p className="text-sm text-text-secondary">Listing Aktif</p>
              </CardContent>
            </Card>
          </div>

          {/* Menu */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">{item.label}</h3>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((listing: any) => (
                    <div key={listing.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-text-secondary">{listing.user?.name} • {listing.category?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-4">Belum ada listing</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
