import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  
  // Giả lập dữ liệu giỏ hàng
  const cart = {
    items: [
      {
        id: '1',
        name: 'Tài khoản Facebook BM đã Verify',
        price: 1200000,
        quantity: 1
      }
    ],
    total: 1200000,
    shipping: 0,
    discount: 0
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/don-hang/success');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          
          <div className="space-y-4 mb-6">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(cart.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí giao dịch</span>
              <span>{formatCurrency(cart.shipping)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-error-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Tổng cộng</span>
              <span>{formatCurrency(cart.total + cart.shipping - cart.discount)}</span>
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
                  onChange={(e) => setPaymentMethod(e.target.value as 'wallet')}
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
                      <p className="text-sm text-gray-500">Số dư: {formatCurrency(2000000)}</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative flex p-4 border rounded-lg cursor-pointer hover:border-primary-500">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'bank')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 rounded-full mr-3 flex items-center justify-center">
                    {paymentMethod === 'bank' && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <CreditCard size={20} className="text-primary-600 mr-2" />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-500">Thanh toán qua Internet Banking</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-warning-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-800">Lưu ý quan trọng</h4>
                  <p className="text-sm text-warning-700">
                    Vui lòng kiểm tra kỹ thông tin sản phẩm trước khi thanh toán. Sản phẩm số hóa không được hoàn trả sau khi giao dịch thành công.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <CreditCard size={20} className="mr-2" />
                  Thanh toán {formatCurrency(cart.total + cart.shipping - cart.discount)}
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