import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import { PromotionModal } from './PromotionModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ListingData {
  id: string
  title: string
  slug: string
  price: number | string
  priceType: string
  images: string[] | null
  location: string
  status: string
  promotionStatus: string | null
  promotionStart: string | null
  promotionEnd: string | null
  promotionDays: number | null
  promotionPrice: number | string | null
  category: {
    id: string
    name: string
  } | null
}

async function getProviderListings(userId: string): Promise<ListingData[]> {
  try {
    const res = await fetch(`${API_URL}/provider/listings`, {
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

function getStatusBadge(status: string | undefined | null) {
  if (!status || status === 'NONE') {
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Tidak Aktif</span>
  }
  switch (status) {
    case 'ACTIVE':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aktif</span>
    case 'PENDING_APPROVAL':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>
    case 'WAITING_PAYMENT':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Menunggu Bayar</span>
    case 'PAYMENT_UPLOADED':
      return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Verifikasi</span>
    case 'REJECTED':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Ditolak</span>
    case 'EXPIRED':
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Expired</span>
    case 'STOPPED':
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Dijeda</span>
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
  }
}

export default async function PromotionsPage() {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  const listings = await getProviderListings(session.user.id)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Promosi Listing</h1>
            <p className="text-gray-600">Kelola promosi listing Anda</p>
          </div>

          {/* Info */}
          <Card className="mb-6" style={{ backgroundColor: '#e6f6ea', borderColor: '#03a21d' }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Tingkatkan Visibilitas Listing Anda</h3>
                  <p className="text-sm text-green-700">
                    Dengan mempromosikan listing, bisnis Anda akan muncul di posisi teratas dan mendapat lebih banyak visibilitas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings */}
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing: ListingData) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <p className="text-sm text-gray-500">{listing.category?.name} • {listing.location}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {getStatusBadge(listing.promotionStatus)}
                          {listing.promotionStatus === 'ACTIVE' && listing.promotionEnd && (
                            <span className="text-xs text-gray-500">
                              Aktif hingga {formatDate(listing.promotionEnd)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {listing.priceType === 'NEGOTIABLE' 
                            ? 'Nego' 
                            : listing.priceType === 'STARTING_FROM'
                            ? `Mulai ${formatPrice(listing.price)}`
                            : formatPrice(listing.price)}
                        </p>
                        <PromotionModal listing={listing as any} action="promote" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Listing</h3>
                <p className="text-gray-500 mb-4">Buat listing terlebih dahulu untuk mempromosikannya</p>
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
