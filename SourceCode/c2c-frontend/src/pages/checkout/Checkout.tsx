import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';
import { createOrder } from '../../services/orderService';

// URL của backend để ghép nối với đường dẫn ảnh
const API_URL = 'http://localhost:3000';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        setError('Giỏ hàng của bạn đang trống.');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    // Chuẩn bị dữ liệu để gửi lên API
    const orderItems = items.map(item => ({
      product_id: parseInt(item.product.id, 10),
      quantity: item.quantity,
    }));

    try {
      const newOrderData = await createOrder(orderItems);
      clearCart();
      alert('Đặt hàng thành công!');
      navigate(`/don-hang/${newOrderData.order.id}`);
    } catch (err: any) {
      console.error('Lỗi khi thanh toán:', err);
      const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary - Phần tóm tắt đơn hàng */}
        <div className="bg-white rounded-lg shadow-custom p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          
          <div className="space-y-4 mb-6">
            {items.map(item => {
              // SỬA LỖI: Xây dựng URL hình ảnh đầy đủ
              const imageUrl = item.product.thumbnail_url
                ? `${API_URL}${item.product.thumbnail_url}`
                : 'https://via.placeholder.com/150?text=No+Image';

              return (
                <div key={item.product.id} className="flex justify-between items-center">
                  {/* THÊM MỚI: Thẻ img để hiển thị ảnh */}
                  <img 
                    src={imageUrl} 
                    alt={item.product.name} 
                    className="w-16 h-16 rounded-md object-cover mr-4 border"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Error'; }}
                  />
                  
                  <div className="flex-grow">
                    <p className="font-medium line-clamp-2">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>

                  <p className="font-medium pl-4">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              );
            })}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Tổng cộng</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Method - Phần chọn phương thức thanh toán */}
        <div>
          <form onSubmit={handleCheckout} className="bg-white rounded-lg shadow-custom p-6">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            
            <div className="space-y-4 mb-6">
               <label className="relative flex p-4 border rounded-lg cursor-pointer hover:border-primary-500">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 rounded-full mr-3 flex items-center justify-center">
                    {paymentMethod === 'wallet' && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Wallet size={20} className="text-primary-600 mr-2" />
                    <div>
                      <p className="font-medium">Ví SànThueKD</p>
                      <p className="text-sm text-gray-500">Thanh toán nhanh và an toàn</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            
            {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-3 my-4 text-sm text-error-700">
                    {error}
                </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="w-full btn btn-primary py-3 flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <CreditCard size={20} className="mr-2" />
                  Thanh toán {formatCurrency(getTotal())}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
