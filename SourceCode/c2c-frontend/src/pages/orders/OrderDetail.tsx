import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập API call
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockOrder: Order = {
            id: id || 'DH123456',
            createdAt: '2024-03-15T08:30:00Z',
            status: 'completed',
            total: 1200000,
            items: [
              {
                id: '1',
                name: 'Facebook BM đã Verify',
                quantity: 1,
                price: 1200000
              }
            ],
            seller: {
              id: '101',
              name: 'Digital Pro',
              rating: 4.8
            },
            paymentMethod: 'Ví SànThueKD',
            paymentStatus: 'paid'
          };
          setOrder(mockOrder);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching order:', error);
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50';
      case 'processing':
        return 'text-accent-600 bg-accent-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      case 'cancelled':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} />;
      case 'processing':
      case 'pending':
        return <Clock size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
        <p className="mt-1 text-sm text-gray-500">
          Đơn hàng không tồn tại hoặc đã bị xóa.
        </p>
        <div className="mt-6">
          <Link to="/don-hang" className="btn btn-primary">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/don-hang" className="flex items-center text-primary-600 hover:text-primary-700">
          <ChevronLeft size={16} className="mr-1" />
          Quay lại danh sách đơn hàng
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold mb-2">Đơn hàng #{order.id}</h1>
            <p className="text-gray-600">Đặt ngày {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusText(order.status)}</span>
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Tổng cộng
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin người bán</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-gray-900">{order.seller.name}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-accent-500">★</span>
                    <span className="ml-1 text-sm text-gray-600">{order.seller.rating}</span>
                  </div>
                </div>
                <button className="btn btn-outline flex items-center">
                  <MessageSquare size={18} className="mr-2" />
                  Chat với người bán
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin thanh toán</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'text-success-600' 
                      : order.paymentStatus === 'pending'
                      ? 'text-warning-600'
                      : 'text-error-600'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền</span>
                  <span className="font-medium">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-custom p-6">
        <h2 className="text-lg font-semibold mb-4">Thao tác</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary">
            Tải hóa đơn
          </button>
          <button className="btn btn-outline">
            Yêu cầu hỗ trợ
          </button>
          {order.status === 'completed' && (
            <button className="btn btn-outline">
              Đánh giá sản phẩm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;