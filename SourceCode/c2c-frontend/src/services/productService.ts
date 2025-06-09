import api from '../api';
import { Product, ProductFilter } from '../types/product';
const API_URL = 'http://localhost:3000';
// Hàm chuyển đổi dữ liệu từ backend sang định dạng Product của frontend
const getRandomRating = () => parseFloat((Math.random() * (5 - 3) + 3).toFixed(1));
const getRandomSold = () => parseInt((Math.random() * (5 - 3) + 3).toFixed(1));
const mapProductFromApi = (apiProduct: any): Product => {
  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description,
    price: parseFloat(apiProduct.price),
    discount: 0, // Backend chưa có trường này, tạm để là 0
    thumbnail_url: apiProduct.thumbnail_url || 'https://via.placeholder.com/300', // Cần có ảnh mặc định
    images: apiProduct.images || (apiProduct.thumbnail_url ? [`${API_URL}${apiProduct.thumbnail_url}`] : []), // Backend chưa có trường này
    category: {
      id: apiProduct.category.id,
      name: apiProduct.category.name,
    },
    seller: {
      id: apiProduct.seller.id.toString(),
      name: apiProduct.seller.username,
      rating: 4.5, // Backend chưa có rating, tạm để giá trị giả
    },
    inStock: apiProduct.status === 'available' ? 100 : 0, // Giả lập số lượng tồn kho
    sold: getRandomSold(), // Backend chưa có trường này
    rating: getRandomRating(), // Backend chưa có trường này
    createdAt: apiProduct.createdAt,
    status: apiProduct.status,
  };
};

export const getRecommendedProducts = async (): Promise<Product[]> => {
    try {
        const response = await api.get('/products/recommendations');
        // Dữ liệu trả về từ backend có thể chưa đúng định dạng của frontend
        // nên chúng ta cần map lại
        return response.data.map(mapProductFromApi);
    } catch (error) {
        // Nếu người dùng chưa đăng nhập, API sẽ trả về lỗi 401,
        // chúng ta sẽ bắt lỗi và trả về mảng rỗng.
        console.log("Không thể lấy sản phẩm gợi ý, có thể do người dùng chưa đăng nhập.");
        return [];
    }
};

export const getProducts = async (
  filter: ProductFilter
): Promise<{ products: Product[]; total: number }> => {
  // Chuyển đổi sort của frontend sang backend
  let sortBy = 'createdAt';
  let sortOrder = 'DESC';
  if (filter.sort === 'price_asc') {
    sortBy = 'price';
    sortOrder = 'ASC';
  } else if (filter.sort === 'price_desc') {
    sortBy = 'price';
    sortOrder = 'DESC';
  }

  const response = await api.get('/products', {
    params: {
      search: filter.search,
      page: filter.page,
      limit: filter.limit,
      categoryId: filter.category,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      sortBy: sortBy,
      sortOrder: sortOrder,
    },
  });

  const products = response.data.products.map(mapProductFromApi);
  return {
    products,
    total: response.data.totalItems,
  };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    if (!response.data) return null;
    return mapProductFromApi(response.data);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
};

export const getPopularProducts = async (): Promise<Product[]> => {
  // Backend chưa hỗ trợ sort theo 'sold', tạm dùng 'updatedAt'
  const response = await api.get('/products', {
    params: { limit: 4, sortBy: 'updatedAt', sortOrder: 'DESC' },
  });
  return response.data.products.map(mapProductFromApi);
};

export const getNewProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products', {
    params: { limit: 4, sortBy: 'createdAt', sortOrder: 'DESC' },
  });
  return response.data.products.map(mapProductFromApi);
};

export const getSimilarProducts = async (productId: string, categoryId: number): Promise<Product[]> => {
    const response = await api.get('/products', {
        params: {
            categoryId,
            limit: 5, // Lấy 5 sản phẩm để lọc ra sản phẩm hiện tại
        },
    });
    const similar = response.data.products
        .filter((p: any) => p.id.toString() !== productId)
        .slice(0, 4)
        .map(mapProductFromApi);
    return similar;
};