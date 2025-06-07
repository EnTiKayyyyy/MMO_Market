import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getMyOrders } from '../../services/orderService'; // Import API service
import type { Order } from '../../services/orderService'; // Import kiểu dữ liệu
import { useAuthStore } from '../../stores/authStore';

const OrderHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State mới để lưu lỗi
  const [filterStatus, setFilterStatus] = useState<string>(''); // State để lọc theo trạng thái

  useEffect(() => {
    // Chỉ fetch dữ liệu khi đã có thông tin người dùng
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null); // Reset lỗi trước mỗi lần fetch
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
        setError('Không thể tải được lịch sử đơn hàng. Vui lòng thử lại sau.');
      } finally {
        // Luôn đảm bảo dừng trạng thái tải, dù thành công hay thất bại
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Chạy lại hook khi người dùng thay đổi (đăng nhập/đăng xuất)

  const getStatusColor = (status: Order['status']) => {
    // ... (hàm này giữ nguyên như cũ)
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-50';
      case 'processing':
      case 'partially_completed':
      case 'paid':
        return 'text-accent-600 bg-accent-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      case 'cancelled':
      case 'disputed':
      case 'refunded':
        return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Order['status']) => {
    // ... (hàm này giữ nguyên như cũ)
     const statusMap = {
        pending: 'Chờ xử lý',
        paid: 'Đã thanh toán',
        processing: 'Đang xử lý',
        partially_completed: 'Hoàn thành một phần',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        disputed: 'Đang khiếu nại',
        refunded: 'Đã hoàn tiền',
    };
    // @ts-ignore
    return statusMap[status] || 'Không xác định';
  };
  
  // Lọc đơn hàng dựa trên trạng thái được chọn
  const filteredOrders = orders.filter(order => 
    filterStatus === '' || order.status === filterStatus
  );

  // Component con để hiển thị nội dung chính
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-red-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-error-500" />
          <h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3>
          <p className="mt-1 text-sm text-error-700">{error}</p>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus ? 'Không có đơn hàng nào khớp với bộ lọc của bạn.' : 'Bạn chưa mua sản phẩm nào. Hãy bắt đầu mua sắm ngay!'}
            </p>
            <div className="mt-6">
              <Link to="/san-pham" className="btn btn-primary">Mua sắm ngay</Link>
            </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                <td className="px-6 py-4 max-w-xs truncate">
                  <div className="text-sm text-gray-900">
                    {order.items.map(item => item.product.name).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(parseFloat(order.total_amount))}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/don-hang/${order.id}`} className="text-primary-600 hover:text-primary-900">Chi tiết</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các đơn hàng của bạn</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        <div className="flex justify-end mb-4">
          <div className="relative w-full md:w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input pr-10 appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="paid">Đã thanh toán</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="disputed">Khiếu nại</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderHistory;
