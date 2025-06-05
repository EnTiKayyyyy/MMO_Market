import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, XCircle, ChevronDown } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { getProducts } from '../../services/productService';
import { Product, ProductFilter } from '../../types/product';
import { formatCurrency } from '../../utils/format';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Trạng thái của bộ lọc
  const [filter, setFilter] = useState<ProductFilter>({
    category: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') as ProductFilter['sort'] || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 8
  });
  
  // Danh sách danh mục sản phẩm
  const categories = [
    { id: 1, name: 'Facebook' },
    { id: 2, name: 'Spotify' },
    { id: 3, name: 'Proxy' },
    { id: 4, name: 'VPS' },
    { id: 5, name: 'Netflix' },
    { id: 6, name: 'Gmail' },
    { id: 7, name: 'Canva' },
    { id: 8, name: 'YouTube' },
  ];
  
  // Lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getProducts(filter);
        setProducts(result.products);
        setTotalProducts(result.total);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
    
    // Cập nhật URL với các tham số lọc
    const newSearchParams = new URLSearchParams();
    
    if (filter.category) newSearchParams.set('category', filter.category.toString());
    if (filter.minPrice) newSearchParams.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) newSearchParams.set('maxPrice', filter.maxPrice.toString());
    if (filter.search) newSearchParams.set('q', filter.search);
    if (filter.sort) newSearchParams.set('sort', filter.sort);
    if (filter.page && filter.page > 1) newSearchParams.set('page', filter.page.toString());
    
    setSearchParams(newSearchParams);
  }, [filter, setSearchParams]);
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilter: Partial<ProductFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      // Đặt lại trang về 1 khi thay đổi bất kỳ bộ lọc nào khác
      page: newFilter.page || 1
    }));
  };
  
  // Xóa bộ lọc
  const clearFilters = () => {
    setFilter({
      sort: 'newest',
      page: 1,
      limit: 8
    });
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    
    handleFilterChange({ search: searchValue || undefined, page: 1 });
  };
  
  // Tính toán số trang
  const totalPages = Math.ceil(totalProducts / filter.limit!);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Sản phẩm kỹ thuật số</h1>
        <p className="text-gray-600">
          Khám phá và mua sắm các sản phẩm kỹ thuật số chất lượng cao
        </p>
      </div>
      
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm sản phẩm..."
              defaultValue={filter.search || ''}
              className="input"
            />
            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-600">
              <Search size={20} />
            </button>
          </div>
        </form>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center"
          >
            <SlidersHorizontal size={18} className="mr-2" />
            Bộ lọc
          </button>
          
          <div className="relative">
            <select
              value={filter.sort || 'newest'}
              onChange={(e) => handleFilterChange({ sort: e.target.value as ProductFilter['sort'] })}
              className="input pr-10 appearance-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Bộ lọc mở rộng */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-custom mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                value={filter.category || ''}
                onChange={(e) => handleFilterChange({ 
                  category: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="input"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá tối thiểu
              </label>
              <input
                type="number"
                placeholder="VNĐ"
                value={filter.minPrice || ''}
                onChange={(e) => handleFilterChange({ 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá tối đa
              </label>
              <input
                type="number"
                placeholder="VNĐ"
                value={filter.maxPrice || ''}
                onChange={(e) => handleFilterChange({ 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="input"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={clearFilters}
              className="btn btn-outline flex items-center"
            >
              <XCircle size={16} className="mr-1" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}
      
      {/* Hiển thị kết quả lọc */}
      {(filter.category || filter.minPrice || filter.maxPrice || filter.search) && (
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <span className="mr-2">Kết quả lọc:</span>
          {filter.category && (
            <span className="badge badge-blue mr-2">
              {categories.find(c => c.id === filter.category)?.name}
              <button 
                onClick={() => handleFilterChange({ category: undefined })}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          )}
          {filter.minPrice && (
            <span className="badge badge-green mr-2">
              Từ {formatCurrency(filter.minPrice)}
              <button 
                onClick={() => handleFilterChange({ minPrice: undefined })}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          )}
          {filter.maxPrice && (
            <span className="badge badge-green mr-2">
              Đến {formatCurrency(filter.maxPrice)}
              <button 
                onClick={() => handleFilterChange({ maxPrice: undefined })}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          )}
          {filter.search && (
            <span className="badge badge-yellow mr-2">
              "{filter.search}"
              <button 
                onClick={() => handleFilterChange({ search: undefined })}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium ml-auto"
          >
            Xóa tất cả
          </button>
        </div>
      )}
      
      {/* Hiển thị sản phẩm */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-custom p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-custom">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Search size={24} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn. Hãy thử thay đổi các tiêu chí tìm kiếm.
          </p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange({ page: Math.max(1, filter.page! - 1) })}
              disabled={filter.page === 1}
              className={`px-3 py-2 rounded-md ${
                filter.page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Trước
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleFilterChange({ page: i + 1 })}
                className={`px-3 py-2 rounded-md ${
                  filter.page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handleFilterChange({ page: Math.min(totalPages, filter.page! + 1) })}
              disabled={filter.page === totalPages}
              className={`px-3 py-2 rounded-md ${
                filter.page === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tiếp
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductList;