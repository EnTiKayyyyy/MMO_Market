import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getPopularProducts, getNewProducts } from '../services/productService';
import { Product } from '../types/product';

const Home = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const popular = await getPopularProducts();
        const newProd = await getNewProducts();
        
        setPopularProducts(popular);
        setNewProducts(newProd);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/san-pham?q=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  const categories = [
    { id: 1, name: 'Tài khoản Facebook', icon: '👤', count: 254 },
    { id: 2, name: 'Tài khoản Spotify', icon: '🎵', count: 187 },
    { id: 3, name: 'Proxy', icon: '🔒', count: 142 },
    { id: 4, name: 'VPS', icon: '💻', count: 98 },
    { id: 5, name: 'Netflix', icon: '🎬', count: 76 },
    { id: 6, name: 'Gmail', icon: '✉️', count: 63 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
            Chợ sản phẩm kỹ thuật số hàng đầu Việt Nam
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-primary-100">
            Mua bán sản phẩm kỹ thuật số một cách an toàn và uy tín
          </p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm kỹ thuật số..."
              className="w-full py-3 px-4 pr-12 rounded-lg border-0 focus:ring-2 focus:ring-primary-300 text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-800"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/san-pham" className="text-primary-600 hover:text-primary-700 flex items-center">
            Xem tất cả <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <Link 
              to={`/san-pham?category=${category.id}`}
              key={category.id} 
              className="bg-white rounded-lg shadow-custom p-4 text-center hover:shadow-custom-lg transition-all duration-200 group"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} sản phẩm</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm phổ biến</h2>
          <Link to="/san-pham?sort=popular" className="text-primary-600 hover:text-primary-700 flex items-center">
            Xem thêm <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-custom p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">Tại sao chọn SànThueKD</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-custom text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">An toàn & Bảo mật</h3>
              <p className="text-gray-600">Hệ thống bảo vệ người mua và thanh toán an toàn, đảm bảo quyền lợi cho cả người mua và người bán.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-custom text-center">
              <div className="w-16 h-16 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Giao dịch nhanh chóng</h3>
              <p className="text-gray-600">Hệ thống tự động xử lý giao dịch 24/7, đảm bảo bạn nhận sản phẩm ngay sau khi thanh toán.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-custom text-center">
              <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc và hỗ trợ giải quyết các vấn đề.</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
          <Link to="/san-pham?sort=newest" className="text-primary-600 hover:text-primary-700 flex items-center">
            Xem thêm <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-custom p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-secondary-600 to-secondary-800 text-white rounded-lg p-8 mb-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Bạn muốn bán sản phẩm kỹ thuật số?</h2>
          <p className="text-secondary-100 max-w-2xl mx-auto mb-8">
            Trở thành người bán trên SànThueKD ngay hôm nay và tiếp cận hàng nghìn khách hàng tiềm năng.
          </p>
          <Link
            to="/dang-ky-nguoi-ban"
            className="btn bg-white text-secondary-700 hover:bg-secondary-50 px-6 py-3 rounded-lg font-medium"
          >
            Đăng ký bán hàng ngay
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Khách hàng nói gì về chúng tôi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h4 className="font-semibold">Nguyễn Văn A</h4>
                <div className="flex text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              "Dịch vụ tuyệt vời! Tôi đã mua proxy trên SànThueKD và chất lượng rất tốt. Giao dịch nhanh chóng, không gặp vấn đề gì."
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h4 className="font-semibold">Trần Thị B</h4>
                <div className="flex text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              "Rất tin tưởng khi sử dụng SànThueKD. Tôi đã mua và bán nhiều tài khoản Facebook, hệ thống bảo mật tốt và hỗ trợ nhiệt tình."
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h4 className="font-semibold">Lê Văn C</h4>
                <div className="flex text-accent-500">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              "Đã sử dụng dịch vụ gần 1 năm. Tính năng chat giữa người mua và người bán rất tiện lợi, giải quyết được nhiều vấn đề."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;