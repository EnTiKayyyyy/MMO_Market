import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      removeItem(productId);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-custom">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link to="/san-pham" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-custom overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center py-4 border-b last:border-0">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <div className="mt-1">
                          {item.product.discount > 0 ? (
                            <div className="flex items-center">
                              <span className="text-error-600 font-medium">
                                {formatCurrency(item.product.price - (item.product.price * item.product.discount / 100))}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                {formatCurrency(item.product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {formatCurrency(item.product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[40px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                            disabled={item.quantity >= item.product.inStock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-error-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-custom p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Tổng giỏ hàng</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí giao dịch</span>
                <span>{formatCurrency(0)}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold">{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </div>
            
            <Link
              to="/thanh-toan"
              className="btn btn-primary w-full mt-6"
            >
              Thanh toán
            </Link>
            
            <Link
              to="/san-pham"
              className="btn btn-outline w-full mt-3"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;