import { useState, useEffect } from 'react'; // SỬA ĐỔI: Thêm useEffect
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Loader2 } from 'lucide-react'; // SỬA ĐỔI: Thêm Loader2
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';
import { createOrder } from '../../services/orderService';
import { useWalletStore } from '../../stores/walletStore'; // SỬA ĐỔI: Import store quản lý ví

const API_URL = 'http://localhost:3000';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  
  // SỬA ĐỔI: Lấy state và actions từ walletStore
  const { balance: walletBalance, isLoading: isWalletLoading, fetchWalletData } = useWalletStore();

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SỬA ĐỔI: Sử dụng useEffect để tải dữ liệu ví khi component được render
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        setError('Giỏ hàng của bạn đang trống.');
        return;
    }
    
    // Kiểm tra nếu thanh toán bằng ví nhưng số dư không đủ
    if (paymentMethod === 'wallet' && walletBalance < getTotal()) {
      setError('Số dư ví không đủ để thực hiện thanh toán. Vui lòng nạp thêm hoặc chọn phương thức khác.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
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
      const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-custom p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          
          <div className="space-y-4 mb-6">
            {items.map(item => {
              const imageUrl = item.product.thumbnail_url
                ? `${API_URL}${item.product.thumbnail_url}`
                : 'https://via.placeholder.com/150?text=No+Image';

              return (
                <div key={item.product.id} className="flex justify-between items-center">
                  <img src={imageUrl} alt={item.product.name} className="w-16 h-16 rounded-md object-cover mr-4 border" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Error'; }}/>
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
        
        {/* Payment Method */}
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
                      <p className="font-medium">Ví của bạn</p>
                      {/* SỬA ĐỔI: Hiển thị số dư thực tế */}
                      <p className="text-sm text-gray-500">
                        {isWalletLoading ? (
                          <span className="flex items-center">
                            <Loader2 size={14} className="animate-spin mr-1" /> Đang tải số dư...
                          </span>
                        ) : (
                          `Số dư: ${formatCurrency(walletBalance)}`
                        )}
                      </p>
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
              disabled={isSubmitting || items.length === 0}
              className="w-full btn btn-primary py-3 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
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