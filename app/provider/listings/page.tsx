import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import { ListingActions } from '@/components/provider/ListingActions'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface SearchParams {
  status?: string
}

interface ListingData {
  id: string
  title: string
  slug: string
  price: number | string
  priceType: string
  images: string[] | null
  location: string
  status: string
  createdAt: string
  category: {
    id: string
    name: string
    type: string
  } | null
}

async function getProviderListings(userId: string, status?: string): Promise<ListingData[]> {
  try {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    
    const res = await fetch(`${API_URL}/provider/listings?${params.toString()}`, {
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
    console.error('Error fetching listings:', error)
    return []
  }
}

async function getProviderStats(userId: string) {
  try {
    const res = await fetch(`${API_URL}/provider/listings`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return { total: 0, active: 0, pending: 0, totalViews: 0 }
    }

    const data = await res.json()
    const listings = data.data || []
    
    return {
      total: listings.length,
      active: listings.filter((l: any) => l.status === 'ACTIVE').length,
      pending: listings.filter((l: any) => l.status === 'PENDING').length,
      totalViews: listings.reduce((acc: number, l: any) => acc + (l.views || 0), 0),
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, active: 0, pending: 0, totalViews: 0 }
  }
}

export default async function ProviderListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  const params = await searchParams
  const statusFilter = params.status

  const [listings, stats] = await Promise.all([
    getProviderListings(session.user.id, statusFilter),
    getProviderStats(session.user.id),
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kelola Listing</h1>
              <p className="text-gray-500 mt-1">Kelola semua listing Anda</p>
            </div>
            <Link href="/provider/listings/new">
              <Button>Tambah Listing</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-gray-500">Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">Menunggu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
                <p className="text-sm text-gray-500">Total Views</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/provider/listings">
              <Button variant={!statusFilter ? 'primary' : 'outline'} size="sm">
                Semua
              </Button>
            </Link>
            <Link href="/provider/listings?status=PENDING">
              <Button variant={statusFilter === 'PENDING' ? 'primary' : 'outline'} size="sm">
                Menunggu
              </Button>
            </Link>
            <Link href="/provider/listings?status=ACTIVE">
              <Button variant={statusFilter === 'ACTIVE' ? 'primary' : 'outline'} size="sm">
                Aktif
              </Button>
            </Link>
            <Link href="/provider/listings?status=INACTIVE">
              <Button variant={statusFilter === 'INACTIVE' ? 'primary' : 'outline'} size="sm">
                Nonaktif
              </Button>
            </Link>
          </div>

          {/* Listings */}
          {listings.length > 0 ? (
            <div className="grid gap-4">
              {listings.map((listing: ListingData) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {listing.images && listing.images.length > 0 ? (
                          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 truncate">{listing.title}</h3>
                            <p className="text-sm text-gray-500">{listing.category?.name} • {listing.location}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {getStatusLabel(listing.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-medium text-primary">
                            {listing.priceType === 'NEGOTIABLE' 
                              ? 'Nego' 
                              : listing.priceType === 'STARTING_FROM'
                              ? `Mulai ${formatPrice(listing.price)}`
                              : formatPrice(listing.price)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Link href={`/provider/listings/${listing.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <ListingActions listingId={listing.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Listing</h3>
                <p className="text-gray-500 mb-4">Mulai dengan membuat listing pertama Anda</p>
                <Link href="/provider/listings/new">
                  <Button>Buat Listing</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
