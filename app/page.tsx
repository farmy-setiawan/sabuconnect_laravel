import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { ListingCard } from '@/components/listings/ListingCard'
import { PromoBanners } from '@/components/home/PromoBanners'
import { MobileLayout } from '@/components/home/MobileLayout'
import { APP_NAME } from '@/lib/constants'
import { Listing } from '@/types'

// Use revalidation for ISR - better than force-dynamic for caching
// This allows the page to be cached but revalidated every 60 seconds
export const revalidate = 60

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
  promotionStatus: string | null
  promotionEnd: string | null
  category: {
    id: string
    name: string
    type: string
  } | null
  user: {
    id: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  } | null
}

interface CategoryData {
  id: string
  name: string
  type: string
  _count: {
    listings: number
  }
}

interface StatsData {
  providers: number
  activeListings: number
  users: number
  categories: number
}

async function getFeaturedListings(): Promise<ListingData[]> {
  try {
    const res = await fetch(`${API_URL}/listings?limit=8&featured=true`, {
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

// Get stats for homepage
async function getStats(): Promise<StatsData> {
  try {
    const res = await fetch(`${API_URL}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return {
        providers: 0,
        activeListings: 0,
        users: 0,
        categories: 0,
      }
    }

    const data = await res.json()
    return {
      providers: data.providers || 0,
      activeListings: data.activeListings || 0,
      users: data.users || 0,
      categories: data.categories || 0,
    }
  } catch {
    return {
      providers: 0,
      activeListings: 0,
      users: 0,
      categories: 0,
    }
  }
}

// Featured categories for the icon grid
const FEATURED_CATEGORIES = [
  { name: 'Jasa', icon: 'briefcase', type: 'JASA' },
  { name: 'Produk', icon: 'shopping-bag', type: 'PRODUK' },
]

export default async function HomePage() {
  const [listings, categories, stats] = await Promise.all([
    getFeaturedListings(),
    getCategories(),
    getStats(),
  ])

  // Separate services and products
  const services = listings.filter(l => l.category?.type === 'JASA')
  const products = listings.filter(l => l.category?.type === 'PRODUK')

  return (
    <MobileLayout>
      <Header />

      <div className="flex-1">
      {/* Hero Section - Trust & Brand */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/90" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 md:w-96 h-40 md:h-96 bg-white rounded-full blur-2xl md:blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 md:w-80 h-32 md:h-80 bg-white rounded-full blur-2xl md:blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container-app py-8 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white/90 text-xs md:text-sm font-medium">Platform Resmi Kabupaten Sabu Raijua</span>
            </div>
            
            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-5 text-balance leading-tight">
              Platform Layanan & Ekonomi Digital Sabu Raijua
            </h1>
            
            <p className="text-sm md:text-xl text-white/85 mb-6 md:mb-8 text-balance max-w-2xl mx-auto">
              Menghubungkan warga, UMKM, dan layanan publik dalam satu platform terpercaya.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  Jelajahi Listing
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b">
        <div className="container-app py-4 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.activeListings}</p>
              <p className="text-xs md:text-sm text-text-secondary">Listing Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.providers}</p>
              <p className="text-xs md:text-sm text-text-secondary">Penyedia Layanan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.users}</p>
              <p className="text-xs md:text-sm text-text-secondary">Pengguna Terdaftar</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.categories}</p>
              <p className="text-xs md:text-sm text-text-secondary">Kategori Layanan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <PromoBanners />

      {/* Categories Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-text-primary">Kategori</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link 
                key={cat.type} 
                href={`/search?categoryType=${cat.type}`}
                className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {cat.icon === 'briefcase' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{cat.name}</p>
                    <p className="text-xs md:text-sm text-text-secondary">
                      {categories.filter(c => c.type === cat.type).reduce((acc, c) => acc + (c._count?.listings || 0), 0)} listing
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* All Categories Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.id}`}
                className="bg-white rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-sm text-text-primary truncate">{category.name}</p>
                <p className="text-xs text-text-secondary">{category._count?.listings || 0} listing</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings - Services */}
      {services.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container-app">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-text-primary">Layanan Populer</h2>
              <Link href="/search?categoryType=JASA" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {services.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing as unknown as Listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Listings - Products */}
      {products.length > 0 && (
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container-app">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-text-primary">Produk Populer</h2>
              <Link href="/search?categoryType=PRODUK" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing as unknown as Listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="container-app text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
            Served untuk Meningkatkan Bisnis Anda?
          </h2>
          <p className="text-white/85 mb-6 md:mb-8 max-w-xl mx-auto">
            Daftar sekarang dan mulai temukan pelanggan baru atau temukan layanan yang Anda butuhkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                Daftar Gratis
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Jelajahi Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>

      <Footer />
    </MobileLayout>
  )
}
