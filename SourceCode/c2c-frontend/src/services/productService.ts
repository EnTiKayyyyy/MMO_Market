import { Product, ProductFilter } from '../types/product';

// Dữ liệu mẫu cho sản phẩm
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tài khoản Facebook BM đã Verify',
    description: 'Tài khoản Business Manager đã được xác minh, có thể chạy quảng cáo không giới hạn.',
    price: 1200000,
    discount: 10,
    thumbnail: 'https://images.pexels.com/photos/5849592/pexels-photo-5849592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/5849592/pexels-photo-5849592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/267482/pexels-photo-267482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 1,
      name: 'Facebook'
    },
    seller: {
      id: '101',
      name: 'Digital Pro',
      rating: 4.8
    },
    inStock: 15,
    sold: 85,
    rating: 4.7,
    createdAt: '2023-11-15T08:30:00Z',
    status: 'active',
    features: ['BM đã verify', 'Có thể chạy quảng cáo', 'Không giới hạn số lượng Page'],
    specifications: {
      'Loại tài khoản': 'Business Manager',
      'Trạng thái': 'Đã verify',
      'Giới hạn quảng cáo': 'Không giới hạn',
      'Thanh toán': 'Đã thiết lập phương thức thanh toán'
    }
  },
  {
    id: '2',
    name: 'Gói Spotify Premium 1 năm',
    description: 'Gói Spotify Premium family dùng trong 1 năm, không quảng cáo, nghe nhạc chất lượng cao.',
    price: 250000,
    discount: 0,
    thumbnail: 'https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 2,
      name: 'Spotify'
    },
    seller: {
      id: '102',
      name: 'Music Store',
      rating: 4.5
    },
    inStock: 200,
    sold: 350,
    rating: 4.9,
    createdAt: '2023-12-01T10:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Proxy Private IPv4 - 1 tháng',
    description: 'Proxy Private IPv4 tốc độ cao, ổn định, phù hợp cho các hoạt động marketing và SEO.',
    price: 500000,
    discount: 15,
    thumbnail: 'https://images.pexels.com/photos/60626/pexels-photo-60626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/60626/pexels-photo-60626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 3,
      name: 'Proxy'
    },
    seller: {
      id: '103',
      name: 'Proxy Master',
      rating: 4.7
    },
    inStock: 50,
    sold: 120,
    rating: 4.6,
    createdAt: '2024-01-10T14:20:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'VPS Windows 10 - RAM 8GB',
    description: 'VPS Windows cấu hình mạnh, phù hợp cho các ứng dụng đòi hỏi hiệu suất cao và ổn định.',
    price: 1800000,
    discount: 0,
    thumbnail: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 4,
      name: 'VPS'
    },
    seller: {
      id: '104',
      name: 'Cloud Solutions',
      rating: 4.9
    },
    inStock: 10,
    sold: 45,
    rating: 4.8,
    createdAt: '2024-02-05T09:00:00Z',
    status: 'active'
  },
  {
    id: '5',
    name: 'Tài khoản Netflix Premium - 1 năm',
    description: 'Tài khoản Netflix Premium UHD 4 màn hình, xem phim không giới hạn trong 1 năm.',
    price: 300000,
    discount: 10,
    thumbnail: 'https://images.pexels.com/photos/5082576/pexels-photo-5082576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/5082576/pexels-photo-5082576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 5,
      name: 'Netflix'
    },
    seller: {
      id: '105',
      name: 'Stream Shop',
      rating: 4.6
    },
    inStock: 30,
    sold: 170,
    rating: 4.7,
    createdAt: '2024-01-20T11:30:00Z',
    status: 'active'
  },
  {
    id: '6',
    name: 'Gmail Edu - Dung lượng không giới hạn',
    description: 'Tài khoản Gmail Edu với dung lượng lưu trữ không giới hạn, phù hợp lưu trữ dữ liệu.',
    price: 150000,
    discount: 0,
    thumbnail: 'https://images.pexels.com/photos/5199340/pexels-photo-5199340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/5199340/pexels-photo-5199340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 6,
      name: 'Gmail'
    },
    seller: {
      id: '106',
      name: 'Email Pro',
      rating: 4.4
    },
    inStock: 100,
    sold: 230,
    rating: 4.5,
    createdAt: '2024-02-15T16:45:00Z',
    status: 'active'
  },
  {
    id: '7',
    name: 'Tài khoản Canva Pro - 1 năm',
    description: 'Canva Pro với đầy đủ tính năng cao cấp, template premium và công cụ thiết kế chuyên nghiệp.',
    price: 200000,
    discount: 5,
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 7,
      name: 'Canva'
    },
    seller: {
      id: '107',
      name: 'Design Hub',
      rating: 4.7
    },
    inStock: 80,
    sold: 150,
    rating: 4.8,
    createdAt: '2024-02-10T13:15:00Z',
    status: 'active'
  },
  {
    id: '8',
    name: 'YouTube Premium - 1 năm',
    description: 'Tài khoản YouTube Premium với xem video không quảng cáo, nghe nhạc nền và tải video.',
    price: 280000,
    discount: 0,
    thumbnail: 'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: {
      id: 8,
      name: 'YouTube'
    },
    seller: {
      id: '108',
      name: 'Media Plus',
      rating: 4.6
    },
    inStock: 40,
    sold: 110,
    rating: 4.7,
    createdAt: '2024-01-25T08:30:00Z',
    status: 'active'
  }
];

/**
 * Lấy danh sách sản phẩm phổ biến
 */
export const getPopularProducts = async (): Promise<Product[]> => {
  // Giả lập API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const popular = [...mockProducts].sort((a, b) => b.sold - a.sold).slice(0, 4);
      resolve(popular);
    }, 500);
  });
};

/**
 * Lấy danh sách sản phẩm mới
 */
export const getNewProducts = async (): Promise<Product[]> => {
  // Giả lập API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newest = [...mockProducts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 4);
      resolve(newest);
    }, 500);
  });
};

/**
 * Lấy danh sách sản phẩm với bộ lọc
 */
export const getProducts = async (filter?: ProductFilter): Promise<{ products: Product[], total: number }> => {
  // Giả lập API call
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProducts];

      // Lọc theo category nếu có
      if (filter?.category) {
        filtered = filtered.filter(p => p.category.id === filter.category);
      }

      // Lọc theo giá nếu có
      if (filter?.minPrice) {
        filtered = filtered.filter(p => p.price >= filter.minPrice!);
      }

      if (filter?.maxPrice) {
        filtered = filtered.filter(p => p.price <= filter.maxPrice!);
      }

      // Lọc theo từ khóa tìm kiếm
      if (filter?.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      // Sắp xếp
      if (filter?.sort) {
        switch(filter.sort) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'popular':
            filtered.sort((a, b) => b.sold - a.sold);
            break;
        }
      }

      // Phân trang
      const page = filter?.page || 1;
      const limit = filter?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      resolve({
        products: filtered.slice(start, end),
        total: filtered.length
      });
    }, 500);
  });
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  // Giả lập API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === id) || null;
      resolve(product);
    }, 500);
  });
};

/**
 * Lấy danh sách sản phẩm tương tự
 */
export const getSimilarProducts = async (productId: string, categoryId: number): Promise<Product[]> => {
  // Giả lập API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const similar = mockProducts
        .filter(p => p.id !== productId && p.category.id === categoryId)
        .slice(0, 4);
      resolve(similar);
    }, 500);
  });
};