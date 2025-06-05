import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  buyer: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const SellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    search: '',
    dateRange: '7days'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Giả lập API call
        setTimeout(() => {
          const mockOrders: Order[] = [
            {
              id: 'DH123456',
              createdAt: '2024-03-15T08:30:00Z',
              status: 'completed',
              total: 1200000,
              buyer: {
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com'
              },
              items: [
                {
                  id: '1',
                  name: 'Tài khoản Facebook BM',
                  quantity: 1,
                  price: 1200000
                }
              ]
            },
            {
              id: 'DH123457',
              createdAt: '2024-03-14T10:15:00Z',
              status: 'processing',
              total: 500000,
              buyer: {
                name: 'Trần Thị B',
                email: 'tranthib@example.com'
              },
              items: [
                {
                  id: '2',
                  name: 'Proxy Private IPv4',
                  quantity: 1,
                  price: 500000
                }
              ]
            }
          ];
          setOrders(mockOrders);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-50 text-success-700';
      case 'processing':
        return 'bg-accent-50 text-accent-700';
      case 'pending':
        return 'bg-warning-50 text-warning-700';
      case 'cancelled':
        return 'bg-error-50 text-error-700';
      default:
        return 'bg-gray-50 text-gray-700';
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các đơn hàng của bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-custom p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="input pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="input appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
              className="input appearance-none"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-custom overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.buyer.name}</div>
                      <div className="text-sm text-gray-500">{order.buyer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/nguoi-ban/don-hang/${order.id}`} className="text-primary-600 hover:text-primary-900">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-custom">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn chưa có đơn hàng nào trong khoảng thời gian này.
          </p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;