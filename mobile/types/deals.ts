export interface Deal {
  id: number;
  title: string;
  marketplace: 'Amazon' | 'Walmart' | 'Target' | string;
  category: string;
  price: number;
  original_price: number;
  discount_percent: number;
  product_url: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealSearchResponse {
  deals: Deal[];
  total: number;
}

export interface FavoriteDeal {
  id: number;
  device_id: string;
  deal_id: number;
  created_at: string;
  deal: Deal;
}

export interface Interest {
  id: number;
  device_id: string;
  category: string;
  keyword: string;
  priority: number;
  created_at: string;
}

export interface DealAlert {
  id: number;
  device_id: string;
  alert_type: string;
  query: string;
  min_discount: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
}

export interface RecommendationResponse {
  device_id: string;
  recommendations: Deal[];
}
