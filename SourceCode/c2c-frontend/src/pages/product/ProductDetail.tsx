import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, MessageSquare, ChevronLeft, Shield, Star, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';

// Import các service và store cần thiết
import { getProductById, getSimilarProducts } from '../../services/productService';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

// Import các hàm và kiểu dữ liệu
import { Product } from '../../types/product';
import { formatCurrency, formatDate } from '../../utils/format';
import ProductCard from '../../components/product/ProductCard';

// URL của backend để hiển thị hình ảnh
const API_URL = 'http://localhost:3000';

const ProductDetail = () => {
  // Lấy ID sản phẩm từ URL
  const { id } = useParams<{ id: string }>();
  
  // State quản lý dữ liệu của trang
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  
  // Lấy các action và state từ store
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Sử dụng hook useNavigate để điều hướng trang trong SPA
  const navigate = useNavigate();
  
  // useEffect để tải dữ liệu chi tiết sản phẩm và các sản phẩm tương tự khi ID thay đổi
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Gọi song song API để tải nhanh hơn
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          // Tạo URL đầy đủ cho ảnh đại diện
          const mainImageUrl = productData.thumbnail_url 
            ? `${API_URL}${productData.thumbnail_url}` 
            : 'https://via.placeholder.com/600x400?text=No+Image';
          setSelectedImage(mainImageUrl);

          // Tải các sản phẩm tương tự dựa trên category
          const similarData = await getSimilarProducts(id, productData.category.id);
          setSimilarProducts(similarData);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chi tiết sản phẩm:', error);
        // Có thể set một state lỗi để hiển thị cho người dùng
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]); // Chạy lại hook này mỗi khi `id` trên URL thay đổi
  
  /**
   * Xử lý khi người dùng nhấn nút "Thêm vào giỏ hàng"
   */
  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
  };
  
  /**
   * Xử lý khi người dùng nhấn nút "Mua ngay"
   */
  const handleBuyNow = () => {
    if (!product) return;
    
    // Bước 1: Thêm sản phẩm vào giỏ hàng
    addItem(product, quantity);
    
    // Bước 2: Điều hướng đến trang thanh toán
    navigate('/thanh-toan');
  };

  /**
   * Xử lý khi người dùng muốn chat với người bán
   */
  const handleChatWithSeller = () => {
    // Yêu cầu đăng nhập nếu chưa xác thực
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để chat với người bán. Đăng nhập ngay?')) {
        navigate('/dang-nhap', { state: { from: `/san-pham/${id}` } });
      }
      return;
    }

    if (product?.seller.id === user?.id) {
        alert("Bạn không thể tự trò chuyện với chính mình.");
        return;
    }

    // Chuyển hướng đến trang tin nhắn và truyền thông tin cần thiết
    navigate('/tin-nhan', { 
      state: { 
        sellerId: product?.seller.id,
        sellerName: product?.seller.name,
        sellerUsername: product?.seller.username,
        productId: product?.id,
        productName: product?.name
      }
    });
  };
  
  // Hàm tính giá sau khi giảm
  const getDiscountedPrice = (p: Product) => {
    return p.price - (p.price * p.discount) / 100;
  };
  
  // Render giao diện loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render khi không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm không tồn tại</h2>
        <p className="mb-6 text-gray-600">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/san-pham" className="btn btn-primary">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }
  
  // Render giao diện chính
  return (
    <div>
      <div className="mb-6">
        <Link to="/san-pham" className="flex items-center text-primary-600 hover:text-primary-700">
          <ChevronLeft size={16} className="mr-1" />
          Quay lại danh sách sản phẩm
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-custom p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery hình ảnh sản phẩm */}
          <div>
            <div className="mb-4 rounded-lg overflow-hidden border">
              <img src={selectedImage} alt={product.name} className="w-full h-80 object-cover"/>
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`border-2 rounded overflow-hidden cursor-pointer ${selectedImage === image ? 'border-primary-600' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img src={image} alt={`${product.name} - ${index + 1}`} className="w-full h-16 object-cover"/>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Thông tin chi tiết và các nút hành động */}
          <div>
            <div className="mb-4">
              <span className={`badge ${getCategoryBadgeColor(product.category.id)}`}>{product.category.name}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
            
            <div className="flex items-center mb-4 text-sm text-gray-500">
              <div className="flex items-center text-accent-500 mr-3">
                <Star size={18} className="fill-current" />
                <span className="ml-1 font-medium">{product.rating}</span>
              </div>
              <span>Đã bán {product.sold}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>Còn {product.inStock} sản phẩm</span>
            </div>
            
            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-error-600">{formatCurrency(getDiscountedPrice(product))}</span>
                  <span className="ml-3 text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                  <span className="ml-2 bg-error-100 text-error-800 text-sm font-medium px-2 py-0.5 rounded">-{product.discount}%</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
              )}
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="text-gray-700 w-32">Người bán:</span>
                <span className="font-medium">{product.seller.name}</span>
                <button onClick={handleChatWithSeller} className="ml-auto btn btn-outline btn-sm flex items-center">
                  <MessageSquare size={16} className="mr-1" /> Chat
                </button>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-gray-700 w-32">Ngày đăng:</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 w-32">Trạng thái:</span>
                <span className="flex items-center text-success-600"><CheckCircle size={16} className="mr-1" /> Còn hàng</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
              <div className="flex items-center">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={quantity <= 1} className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500">-</button>
                <input type="number" id="quantity" min="1" max={product.inStock} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.inStock, Number(e.target.value))))} className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-0"/>
                <button onClick={() => setQuantity(prev => Math.min(product.inStock, prev + 1))} disabled={quantity >= product.inStock} className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary-500">+</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <button onClick={handleAddToCart} className="btn btn-outline flex-1 py-3 flex items-center justify-center"><ShoppingCart size={20} className="mr-2" /> Thêm vào giỏ</button>
              <button onClick={handleBuyNow} className="btn btn-primary flex-1 py-3 flex items-center justify-center">Mua ngay</button>
            </div>
            
             <div className="rounded-lg bg-gray-50 p-4 flex items-start">
                <Shield size={20} className="text-secondary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Cam kết của chúng tôi</h4>
                  <p className="text-sm text-gray-600">Sản phẩm 100% như mô tả. Hoàn tiền nếu không đúng cam kết.</p>
                </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Tab mô tả và thông số */}
      <div className="bg-white rounded-lg shadow-custom p-6 mb-8">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('description')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'description' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Mô tả sản phẩm</button>
            <button onClick={() => setActiveTab('specifications')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'specifications' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Thông số</button>
          </nav>
        </div>
        
        <div>
          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
          )}
          {activeTab === 'specifications' && (
            <div>
              {product.specifications ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full"><tbody className="divide-y divide-gray-200">
                      {Object.entries(product.specifications).map(([key, value], index) => (<tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}><td className="px-6 py-4 text-sm font-medium text-gray-900">{key}</td><td className="px-6 py-4 text-sm text-gray-700">{value}</td></tr>))}
                  </tbody></table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có thông số kỹ thuật cho sản phẩm này.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sản phẩm tương tự */}
      {similarProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Sản phẩm tương tự</h2>
            <Link to={`/san-pham?category=${product.category.id}`} className="text-primary-600 hover:text-primary-700 flex items-center text-sm">Xem thêm <ChevronRight size={16} className="ml-1" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(p => (<ProductCard key={p.id} product={p} />))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hàm helper để tạo màu cho badge danh mục
const getCategoryBadgeColor = (categoryId: number) => {
  const colors = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-red'];
  return colors[categoryId % colors.length];
};

export default ProductDetail;
