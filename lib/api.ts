// Laravel API Helper
// Menggantikan Prisma dengan panggilan ke Laravel API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth helpers
export async function login(email: string, password: string) {
  return apiFetch<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: { name: string; email: string; password: string; phone: string; role?: string }) {
  return apiFetch<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string) {
  return apiFetch<{ user: any }>('/auth/me', { token });
}

export async function logout(token: string) {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
  });
}

// Listings
export async function getListings(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ data: any[] }>(`/listings${query}`);
}

export async function getListingBySlug(slug: string) {
  return apiFetch<{ data: any }>(`/listings/${slug}`);
}

export async function getMyListings(token: string) {
  return apiFetch<{ data: any[] }>('/my/listings', { token });
}

export async function createListing(token: string, data: any) {
  return apiFetch<{ data: any }>('/listings', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateListing(token: string, id: string, data: any) {
  return apiFetch<{ data: any }>(`/listings/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteListing(token: string, id: string) {
  return apiFetch<{ message: string }>(`/listings/${id}`, {
    method: 'DELETE',
    token,
  });
}

// Categories
export async function getCategories() {
  return apiFetch<{ data: any[] }>('/categories');
}

// Villages
export async function getVillages() {
  return apiFetch<{ data: any[] }>('/villages');
}

// Promo Banners
export async function getPromoBanners() {
  return apiFetch<{ data: any[] }>('/promo-banners');
}

// Site Settings
export async function getSiteSettings() {
  return apiFetch<{ data: any }>('/site-settings');
}

// Transactions
export async function getTransactions(token: string) {
  return apiFetch<{ data: any[] }>('/transactions', { token });
}

export async function createTransaction(token: string, data: any) {
  return apiFetch<{ data: any }>('/transactions', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

// Bank Accounts
export async function getBankAccounts(token: string) {
  return apiFetch<{ data: any[] }>('/bank-accounts', { token });
}

export async function createBankAccount(token: string, data: any) {
  return apiFetch<{ data: any }>('/bank-accounts', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

// Promotions
export async function promoteListing(token: string, listingId: string, data: any) {
  return apiFetch<{ data: any }>(`/listings/${listingId}/promote`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function stopPromotion(token: string, listingId: string) {
  return apiFetch<{ data: any }>(`/listings/${listingId}/stop-promotion`, {
    method: 'POST',
    token,
  });
}

// Ads
export async function getAds(token: string) {
  return apiFetch<{ data: any[] }>('/ads', { token });
}

export async function createAd(token: string, data: any) {
  return apiFetch<{ data: any }>('/ads', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

// Admin endpoints
export async function getAdminListings(token: string) {
  return apiFetch<{ data: any[] }>('/admin/listings', { token });
}

export async function updateAdminListingStatus(token: string, id: string, status: string) {
  return apiFetch<{ data: any }>(`/admin/listings/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}

export async function getAdminUsers(token: string) {
  return apiFetch<{ data: any[] }>('/admin/users', { token });
}

export async function verifyUser(token: string, id: string) {
  return apiFetch<{ data: any }>(`/admin/users/${id}/verify`, {
    method: 'PATCH',
    token,
  });
}

export async function getAdminBankAccounts(token: string) {
  return apiFetch<{ data: any[] }>('/admin/bank-accounts', { token });
}

export async function getAdminPromoBanners(token: string) {
  return apiFetch<{ data: any[] }>('/admin/promo-banners', { token });
}

export async function createAdminPromoBanner(token: string, data: any) {
  return apiFetch<{ data: any }>('/admin/promo-banners', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function getAdminPromotions(token: string) {
  return apiFetch<{ data: any[] }>('/admin/promotions', { token });
}

export async function verifyPromotion(token: string, id: string) {
  return apiFetch<{ data: any }>(`/admin/promotions/${id}/verify`, {
    method: 'PATCH',
    token,
  });
}

export async function getAdminAds(token: string) {
  return apiFetch<{ data: any[] }>('/admin/ads', { token });
}

export async function verifyAd(token: string, id: string) {
  return apiFetch<{ data: any }>(`/admin/ads/${id}/verify`, {
    method: 'PATCH',
    token,
  });
}

export async function updateSiteSettings(token: string, data: any) {
  return apiFetch<{ data: any }>('/admin/site-settings', {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}
