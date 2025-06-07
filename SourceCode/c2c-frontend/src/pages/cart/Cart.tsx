import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/format';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

// URL của backend để ghép nối với đường dẫn ảnh
const API_URL = 'http://localhost:3000';

const Cart = () => {
  const navigate = useNavigate();
  const { items, getTotal, removeItem, updateQuantity, clearCart } = useCartStore();

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = () => {
    navigate('/thanh-toan');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
        <p className="text-gray-600 mt-1">Kiểm tra lại các sản phẩm trước khi thanh toán.</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-custom p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Xóa</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => {
                    // SỬA ĐỔI: Xây dựng URL hình ảnh đầy đủ
                    const imageUrl = item.product.thumbnail_url
                      ? `${API_URL}${item.product.thumbnail_url}`
                      : 'https://via.placeholder.com/150?text=No+Image';

                    return (
                      <tr key={item.product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {/* THÊM MỚI: Thẻ img để hiển thị ảnh */}
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-16 h-16 rounded-md object-cover mr-4 border"
                              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Error'; }}
                            />
                            <div className="flex-grow">
                              <p className="font-medium text-gray-900 line-clamp-2">{item.product.name}</p>
                              <p className="text-sm text-gray-500">Người bán: {item.product.seller.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value))}
                            className="w-20 input text-center"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(item.product.price * item.quantity)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={() => removeItem(item.product.id)} className="text-error-600 hover:text-error-800">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={clearCart} className="btn btn-outline text-error-600 border-error-300 hover:bg-error-50">Xóa hết giỏ hàng</button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-custom p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Tổng cộng</h2>
              <div className="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-4 mt-4">
                <span>Tổng tiền</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary mt-6 py-3"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-custom">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Giỏ hàng của bạn đang trống</h3>
          <p className="mt-1 text-sm text-gray-500">Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
          <div className="mt-6">
            <Link to="/" className="btn btn-primary inline-flex items-center">
                <ArrowLeft size={16} className="mr-2" />
                Quay lại trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
