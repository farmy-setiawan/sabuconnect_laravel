import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { ListingCard } from '@/components/listings/ListingCard'
import { SearchFilters } from './SearchFilters'
import { Listing, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface SearchParams {
  q?: string
  categoryId?: string
  type?: string
  location?: string
  village?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  page?: string
}

interface ListingData {
  id: string
  title: string
  slug: string
  description: string
  price: number | string
  priceType: string
  images: string[] | null
  location: string
  phone: string | null
  status: string
  isFeatured: boolean
  views: number
  userId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    type: string
  } | null
  user: {
    id: string
    name: string | null
    avatar: string | null
  } | null
}

interface CategoryData {
  id: string
  name: string
  slug: string
  type: string
}

async function getListings(params: SearchParams) {
  const { q, categoryId, type, location, village, minPrice, maxPrice, sortBy, page } = params

  try {
    // Build query string
    const queryParams = new URLSearchParams()
    if (q) queryParams.set('q', q)
    if (categoryId) queryParams.set('categoryId', categoryId)
    if (type) queryParams.set('type', type)
    if (location) queryParams.set('location', location)
    if (village) queryParams.set('village', village)
    if (minPrice) queryParams.set('minPrice', minPrice)
    if (maxPrice) queryParams.set('maxPrice', maxPrice)
    if (sortBy) queryParams.set('sortBy', sortBy)
    if (page) queryParams.set('page', page)
    queryParams.set('limit', '12')

    const res = await fetch(`${API_URL}/listings?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return {
        listings: [],
        pagination: {
          page: parseInt(page || '1'),
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      }
    }

    const data = await res.json()
    return {
      listings: data.data || [],
      pagination: {
        page: parseInt(page || '1'),
        limit: 12,
        total: data.meta?.total || 0,
        totalPages: data.meta?.last_page || 1,
      },
    }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return {
      listings: [],
      pagination: {
        page: parseInt(page || '1'),
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    }
  }
}

async function getCategories(): Promise<CategoryData[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
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
  } catch {
    return []
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [{ listings, pagination }, categories] = await Promise.all([
    getListings(params),
    getCategories(),
  ])

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />

      <main className="flex-1 bg-background pb-4 md:pb-0">
        <div className="container-app py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-border p-4 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Filter</h2>
                <SearchFilters categories={categories as unknown as Category[]} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-text-secondary">
                  Ditemukan <span className="font-semibold text-text-primary">{pagination.total}</span> listing
                </p>
              </div>

              {/* Listings Grid */}
              {listings.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((listing: ListingData) => (
                      <ListingCard key={listing.id} listing={listing as unknown as Listing} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <a
                          key={pageNum}
                          href={`/search?${new URLSearchParams({ ...params, page: pageNum.toString() }).toString()}`}
                          className={`px-4 py-2 rounded-lg ${
                            pageNum === pagination.page
                              ? 'bg-primary text-white'
                              : 'bg-white border border-border text-text-primary hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg border border-border p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
                  <p className="text-text-secondary">Coba ubah filter pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
