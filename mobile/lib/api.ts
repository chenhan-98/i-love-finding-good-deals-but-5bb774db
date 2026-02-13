import type {
  DealAlert,
  DealSearchResponse,
  FavoriteDeal,
  Interest,
  RecommendationResponse,
} from '@/types/deals';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const DEVICE_ID = 'demo-user-1';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const mergedHeaders = new Headers({
    'Content-Type': 'application/json',
  });

  if (options?.headers) {
    const incomingHeaders = new Headers(options.headers);
    incomingHeaders.forEach((value, key) => mergedHeaders.set(key, value));
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return (await response.json()) as T;
}

export function fetchDeals(params: {
  q?: string;
  category?: string;
  minDiscount?: number;
  marketplace?: string;
}): Promise<DealSearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.set('q', params.q);
  if (params.category && params.category !== 'All') queryParams.set('category', params.category);
  if (typeof params.minDiscount === 'number') {
    queryParams.set('min_discount', String(params.minDiscount));
  }
  if (params.marketplace && params.marketplace !== 'All') {
    queryParams.set('marketplace', params.marketplace);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/deals?${queryString}` : '/deals';
  return apiRequest<DealSearchResponse>(endpoint);
}

export function refreshDeals(): Promise<DealSearchResponse> {
  return apiRequest<DealSearchResponse>('/deals/refresh', {
    method: 'POST',
    body: JSON.stringify({ limit: 18 }),
  });
}

export function fetchCategories(): Promise<string[]> {
  return apiRequest<string[]>('/deals/categories');
}

export function addFavorite(dealId: number): Promise<FavoriteDeal> {
  return apiRequest<FavoriteDeal>('/deals/favorites', {
    method: 'POST',
    body: JSON.stringify({ device_id: DEVICE_ID, deal_id: dealId }),
  });
}

export function removeFavorite(dealId: number): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/deals/favorites/${DEVICE_ID}/${dealId}`, {
    method: 'DELETE',
  });
}

export function fetchFavorites(): Promise<FavoriteDeal[]> {
  return apiRequest<FavoriteDeal[]>(`/deals/favorites/${DEVICE_ID}`);
}

export function fetchRecommendations(): Promise<RecommendationResponse> {
  return apiRequest<RecommendationResponse>(`/deals/recommendations/${DEVICE_ID}`);
}

export function fetchInterests(): Promise<Interest[]> {
  return apiRequest<Interest[]>(`/deals/interests/${DEVICE_ID}`);
}

export function createInterest(payload: {
  category: string;
  keyword: string;
  priority: number;
}): Promise<Interest> {
  return apiRequest<Interest>('/deals/interests', {
    method: 'POST',
    body: JSON.stringify({ device_id: DEVICE_ID, ...payload }),
  });
}

export function fetchAlerts(): Promise<DealAlert[]> {
  return apiRequest<DealAlert[]>(`/deals/alerts/${DEVICE_ID}`);
}

export function createAlert(payload: {
  alert_type: string;
  query: string;
  min_discount: number;
  is_enabled: boolean;
}): Promise<DealAlert> {
  return apiRequest<DealAlert>('/deals/alerts', {
    method: 'POST',
    body: JSON.stringify({ device_id: DEVICE_ID, ...payload }),
  });
}

export function updateAlert(
  alertId: number,
  payload: { min_discount?: number; is_enabled?: boolean }
): Promise<DealAlert> {
  return apiRequest<DealAlert>(`/deals/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function recordShare(payload: { deal_id: number; channel: string; message: string }) {
  return apiRequest('/deals/share', {
    method: 'POST',
    body: JSON.stringify({ device_id: DEVICE_ID, ...payload }),
  });
}
