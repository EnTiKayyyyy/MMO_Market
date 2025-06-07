import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { adminGetOrders } from '../../services/adminService';
import type { AdminOrder } from '../../services/adminService';

const AdminOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = {
            search: filter.search || undefined,
            status: filter.status || undefined,
        }
        const response = await adminGetOrders(params);
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng (admin):", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const getStatusText = (status: string) => ({ pending: 'Chờ xử lý', paid: 'Đã thanh toán', completed: 'Hoàn thành', cancelled: 'Đã hủy', disputed: 'Khiếu nại' }[status] || status);
  const getStatusColor = (status: string) => ({ paid: 'text-success-600 bg-success-50', completed: 'text-blue-600 bg-blue-50', cancelled: 'text-error-600 bg-error-50', pending: 'text-warning-600 bg-warning-50'}[status] || 'text-gray-600 bg-gray-50');

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Quản lý đơn hàng</h1><p className="text-gray-600 mt-1">Xem và quản lý tất cả đơn hàng trong hệ thống</p></div>
      <div className="bg-white rounded-lg shadow-custom p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label><div className="relative"><input type="text" placeholder="Tìm theo mã đơn hàng, email..." className="input pr-10" value={filter.search} onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))} /><Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select className="input" value={filter.status} onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}><option value="">Tất cả trạng thái</option><option value="pending">Chờ xử lý</option><option value="paid">Đã thanh toán</option><option value="completed">Hoàn thành</option><option value="cancelled">Đã hủy</option><option value="disputed">Khiếu nại</option></select></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-custom overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{order.buyer.full_name}</div><div className="text-sm text-gray-500">{order.buyer.username}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(parseFloat(order.total_amount))}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Link to={`/quan-tri/don-hang/${order.id}`} className="text-primary-600 hover:text-primary-900">Chi tiết</Link></td>
                </tr>
            ))}</tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
