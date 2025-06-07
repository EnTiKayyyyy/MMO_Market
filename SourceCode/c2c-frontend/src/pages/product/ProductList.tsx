import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, XCircle, ChevronDown } from 'lucide-react';

// Import các service để gọi API
import { getProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';

// Import các component và type cần thiết
import ProductCard from '../../components/product/ProductCard';
import { Product, ProductFilter } from '../../types/product';
import type { Category } from '../../services/categoryService';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filter, setFilter] = useState<ProductFilter>({
    category: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    search: searchParams.get('q') || undefined,
    sort: (searchParams.get('sort') as ProductFilter['sort']) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  });
  
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const catData = await getAllCategories();
            setCategories(catData);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getProducts(filter);
        setProducts(result.products);
        setTotalProducts(result.total);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimeout = setTimeout(() => {
        fetchProducts();
    }, 300);

    const newSearchParams = new URLSearchParams();
    if (filter.category) newSearchParams.set('category', filter.category.toString());
    if (filter.minPrice) newSearchParams.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) newSearchParams.set('maxPrice', filter.maxPrice.toString());
    if (filter.search) newSearchParams.set('q', filter.search);
    if (filter.sort && filter.sort !== 'newest') newSearchParams.set('sort', filter.sort);
    if (filter.page && filter.page > 1) newSearchParams.set('page', filter.page.toString());
    setSearchParams(newSearchParams, { replace: true });
    
    return () => clearTimeout(debounceTimeout);
  }, [filter, setSearchParams]);
  
  const handleFilterChange = (newFilter: Partial<ProductFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      page: 1, 
    }));
  };

  // --- SỬA LỖI: Tạo hàm riêng để xử lý chuyển trang ---
  const handlePageChange = (newPage: number) => {
    setFilter(prev => ({
      ...prev,
      page: newPage
    }));
  };
  // --- KẾT THÚC SỬA LỖI ---

  const clearFilters = () => {
    setFilter({ sort: 'newest', page: 1, limit: 12 });
  };
  
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-custom p-4 animate-pulse">
      <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
  
  const totalPages = Math.ceil(totalProducts / filter.limit!);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tất cả Sản phẩm</h1>
        <p className="text-gray-600">Khám phá và mua sắm các sản phẩm kỹ thuật số chất lượng cao</p>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1"><div className="relative"><input type="text" placeholder="Tìm kiếm sản phẩm..." defaultValue={filter.search || ''} onChange={(e) => handleFilterChange({ search: e.target.value })} className="input"/></div></div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline flex items-center"><SlidersHorizontal size={18} className="mr-2" />Bộ lọc</button>
          <div className="relative"><select value={filter.sort || 'newest'} onChange={(e) => handleFilterChange({ sort: e.target.value as ProductFilter['sort'] })} className="input pr-10 appearance-none"><option value="newest">Mới nhất</option><option value="popular">Phổ biến</option><option value="price_asc">Giá: Thấp đến cao</option><option value="price_desc">Giá: Cao đến thấp</option></select><ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" /></div>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-custom mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label><select value={filter.category || ''} onChange={(e) => handleFilterChange({ category: e.target.value ? Number(e.target.value) : undefined })} className="input"><option value="">Tất cả danh mục</option>{categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá tối thiểu</label><input type="number" placeholder="VNĐ" value={filter.minPrice || ''} onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })} className="input"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá tối đa</label><input type="number" placeholder="VNĐ" value={filter.maxPrice || ''} onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} className="input"/></div>
          </div>
          <div className="flex justify-end mt-4"><button onClick={clearFilters} className="btn btn-outline flex items-center"><XCircle size={16} className="mr-1" />Xóa bộ lọc</button></div>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}</div>
      ) : products.length > 0 ? (
        <>
            <div className="mb-4 text-sm text-gray-600">Tìm thấy <strong>{totalProducts}</strong> sản phẩm.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{products.map(product => (<ProductCard key={product.id} product={product} />))}</div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-custom"><Search size={32} className="mx-auto text-gray-400" /><h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Không tìm thấy sản phẩm</h3><p className="text-gray-600 max-w-md mx-auto mb-6">Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi hoặc xóa bộ lọc.</p><button onClick={clearFilters} className="btn btn-primary">Xóa bộ lọc</button></div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center"><nav className="flex items-center space-x-2">
            {/* --- SỬA LỖI: Gọi hàm handlePageChange --- */}
            <button onClick={() => handlePageChange(Math.max(1, filter.page! - 1))} disabled={filter.page === 1} className="px-3 py-2 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100">Trước</button>
            {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 rounded-md ${filter.page === i + 1 ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{i + 1}</button>))}
            <button onClick={() => handlePageChange(Math.min(totalPages, filter.page! + 1))} disabled={filter.page === totalPages} className="px-3 py-2 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100">Tiếp</button>
            {/* --- KẾT THÚC SỬA LỖI --- */}
        </nav></div>
      )}
    </div>
  );
};

export default ProductList;