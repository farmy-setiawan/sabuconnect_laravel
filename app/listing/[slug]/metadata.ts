import { Metadata } from 'next'
import { apiFetch } from '@/lib/api'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    // Call Laravel API to get listing
    const response = await apiFetch<{ data: any }>(`/listings/${slug}`)
    const listing = response.data

    if (!listing) {
      return {
        title: 'Listing Tidak Ditemukan - SABUConnect',
      }
    }

    const price = typeof listing.price === 'string' ? parseFloat(listing.price) : Number(listing.price)
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price)

    const listingImage = listing.images && (listing.images as string[]).length > 0 ? (listing.images as string[])[0] : null
    const imageUrl = listingImage ? listingImage : '/images/hero-bg.jpg'

    return {
      title: `${listing.title} - ${formattedPrice} | SABUConnect`,
      description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
      openGraph: {
        title: `${listing.title} - ${formattedPrice} | SABUConnect`,
        description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
        type: 'website',
        url: `https://sabuconnect.web.id/listing/${slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: listing.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${listing.title} - ${formattedPrice} | SABUConnect`,
        description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Listing - SABUConnect',
    }
  }
}
