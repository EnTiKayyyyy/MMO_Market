import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getMySellerOrders } from '../../services/sellerService';
import type { SellerOrder } from '../../services/sellerService';

const SellerOrders = () => {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await getMySellerOrders();
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng của người bán:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
        completed: 'bg-success-50 text-success-700',
        processing: 'bg-accent-50 text-accent-700',
        paid: 'bg-blue-50 text-blue-700',
        pending: 'bg-warning-50 text-warning-700',
        cancelled: 'bg-error-50 text-error-700',
        disputed: 'bg-red-50 text-red-700'
    };
    return statusMap[status] || 'bg-gray-50 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
        completed: 'Hoàn thành',
        processing: 'Đang xử lý',
        paid: 'Đã thanh toán',
        pending: 'Chờ xử lý',
        cancelled: 'Đã hủy',
        disputed: 'Đang khiếu nại'
    };
    return statusMap[status] || 'Không xác định';
  };
  
  const filteredOrders = orders.filter(order =>
    (filter.status === '' || order.status === filter.status) &&
    (order.id.toString().includes(filter.search) || order.buyer.full_name.toLowerCase().includes(filter.search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các đơn hàng của bạn</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo Mã đơn hàng hoặc Tên người mua..."
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
              <option value="paid">Đã thanh toán</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="disputed">Đang khiếu nại</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-custom overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm của bạn</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.buyer.full_name}</div>
                        <div className="text-sm text-gray-500">{order.buyer.username}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.items.map(item => item.product_name).join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/nguoi-ban/don-hang/${order.id}`} className="text-primary-600 hover:text-primary-900">Chi tiết</Link>
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
          <p className="mt-1 text-sm text-gray-500">Bạn chưa có đơn hàng nào.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
