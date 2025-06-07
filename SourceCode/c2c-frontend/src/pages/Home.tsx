import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Tags, Shield, BarChart, Clock } from 'lucide-react';

// Import các service để gọi API
import { getPopularProducts, getNewProducts } from '../services/productService';
import { getAllCategories } from '../services/categoryService';

// Import các component và type cần thiết
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types/product';
import type { Category } from '../services/categoryService';

const Home = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // useEffect để tải tất cả dữ liệu cần thiết cho trang chủ khi component được mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Gọi song song các API để tăng tốc độ tải trang
        const [popular, newProd, cats] = await Promise.all([
            getPopularProducts(),
            getNewProducts(),
            getAllCategories()
        ]);
        
        setPopularProducts(popular);
        setNewProducts(newProd);
        setCategories(cats);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/san-pham?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Component skeleton để hiển thị khi đang tải dữ liệu
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-custom p-4 animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-12 rounded-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
            Chợ sản phẩm kỹ thuật số hàng đầu Việt Nam
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-primary-100">
            Mua bán sản phẩm kỹ thuật số một cách an toàn và uy tín
          </p>
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
            <input type="text" placeholder="Tìm kiếm sản phẩm kỹ thuật số..." className="w-full py-3 px-4 pr-12 rounded-lg border-0 focus:ring-2 focus:ring-primary-300 text-gray-900" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-800"><Search size={20} /></button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/san-pham" className="text-primary-600 hover:text-primary-700 flex items-center">Xem tất cả <ChevronRight size={16} className="ml-1" /></Link>
        </div>
        {isLoading ? (
             <div className="text-center p-4 text-gray-500">Đang tải danh mục...</div>
        ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(category => (
                <Link to={`/san-pham?category=${category.id}`} key={category.id} className="bg-white rounded-lg shadow-custom p-4 text-center hover:shadow-custom-lg transition-all duration-200 group">
                <div className="text-3xl mb-2 text-primary-500 flex justify-center"><Tags/></div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors h-12 flex items-center justify-center">{category.name}</h3>
                </Link>
            ))}
            </div>
        ) : (
            <div className="text-center p-4 text-gray-500">Không có danh mục nào để hiển thị.</div>
        )}
      </section>

      {/* New Products */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
          <Link to="/san-pham?sort=newest" className="text-primary-600 hover:text-primary-700 flex items-center">Xem thêm <ChevronRight size={16} className="ml-1" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : newProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
