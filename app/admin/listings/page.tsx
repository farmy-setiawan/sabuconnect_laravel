import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import { ListingActions } from '@/components/admin/ListingActions'

interface SearchParams {
  status?: string
}

interface ListingData {
  id: string
  title: string
  slug: string
  price: number | string
  priceType: string
  location: string
  status: string
  images: string[] | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
  category: {
    id: string
    name: string
  } | null
}

interface Stats {
  total: number
  pending: number
  active: number
  inactive: number
  rejected: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function getAllListings(status?: string): Promise<ListingData[]> {
  try {
    const params = status ? `?status=${status}` : ''
    const res = await fetch(`${API_URL}/admin/listings${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Failed to fetch listings:', res.status)
      return []
    }

    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
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
      console.error('Failed to fetch stats:', res.status)
      return { total: 0, pending: 0, active: 0, inactive: 0, rejected: 0 }
    }

    const data = await res.json()
    return {
      total: data.totalListings || 0,
      pending: data.pendingListings || 0,
      active: data.activeListings || 0,
      inactive: data.inactiveListings || 0,
      rejected: data.rejectedListings || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, pending: 0, active: 0, inactive: 0, rejected: 0 }
  }
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const statusFilter = params.status

  const [listings, stats] = await Promise.all([
    getAllListings(statusFilter),
    getStats(),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif'
      case 'PENDING':
        return 'Menunggu'
      case 'INACTIVE':
        return 'Nonaktif'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Kelola Listing</h1>
            <p className="text-text-secondary">Verifikasi dan moderasi listing</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-text-secondary">Menunggu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-text-secondary">Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                <p className="text-sm text-text-secondary">Nonaktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-text-secondary">Ditolak</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/admin/listings">
              <Button variant={!statusFilter ? 'primary' : 'outline'} size="sm">
                Semua
              </Button>
            </Link>
            <Link href="/admin/listings?status=PENDING">
              <Button variant={statusFilter === 'PENDING' ? 'primary' : 'outline'} size="sm">
                Menunggu
              </Button>
            </Link>
            <Link href="/admin/listings?status=ACTIVE">
              <Button variant={statusFilter === 'ACTIVE' ? 'primary' : 'outline'} size="sm">
                Aktif
              </Button>
            </Link>
            <Link href="/admin/listings?status=INACTIVE">
              <Button variant={statusFilter === 'INACTIVE' ? 'primary' : 'outline'} size="sm">
                Nonaktif
              </Button>
            </Link>
            <Link href="/admin/listings?status=REJECTED">
              <Button variant={statusFilter === 'REJECTED' ? 'primary' : 'outline'} size="sm">
                Ditolak
              </Button>
            </Link>
          </div>

          {/* Listings Table */}
          {listings.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary w-20">Gambar</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Judul</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Penyedia</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Kategori</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Harga</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Lokasi</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing: ListingData) => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {(listing.images as string[] | null) && (listing.images as string[]).length > 0 ? (
                              <img 
                                src={(listing.images as string[])[0]} 
                                alt={listing.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                w-8 h<svg className="-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-xs text-text-secondary">{listing.slug}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{listing.user?.name || '-'}</p>
                            <p className="text-xs text-text-secondary">{listing.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {listing.category?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {listing.priceType === 'NEGOTIABLE' 
                            ? 'Nego' 
                            : listing.priceType === 'STARTING_FROM'
                            ? `Mulai ${formatPrice(listing.price)}`
                            : formatPrice(listing.price)}
                        </td>
                        <td className="py-3 px-4 text-sm">{listing.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {getStatusLabel(listing.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {formatDate(listing.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <ListingActions listingId={listing.id} currentStatus={listing.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Listing</h3>
                <p className="text-text-secondary">Belum ada listing dalam sistem</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
