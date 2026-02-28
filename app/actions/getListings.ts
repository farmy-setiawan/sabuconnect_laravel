import { auth } from '@/lib/auth'
import { getMyListings } from '@/lib/api'

export async function getProviderListings() {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    return []
  }

  try {
    // Get token from session - adjust based on your auth implementation
    const token = (session as any).token || (session as any).accessToken
    
    if (!token) {
      console.error('No token found in session')
      return []
    }

    const response = await getMyListings(token)
    
    if (!response.data) {
      return []
    }

    return response.data.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      slug: listing.slug,
      price: listing.price?.toString() || '0',
      category: listing.category,
      images: listing.images,
    }))
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return []
  }
}
