export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  thumbnail_url: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    username: string; // Thêm username
    rating: number;
  };
  inStock: number;
  sold: number;
  rating: number;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
  features?: string[];
  specifications?: {
    [key: string]: string;
  };
}

export interface ProductFilter {
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  search?: string;
  page?: number;
  limit?: number;
}
