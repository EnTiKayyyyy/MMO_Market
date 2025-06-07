import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, BarChart, ShoppingCart, Send, ArrowRight, Clock } from 'lucide-react';

// Import các service và component cần thiết
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getSellerDashboardStats } from '../../services/sellerService';
import { useAuthStore } from '../../stores/authStore';
import WithdrawModal from '../../components/seller/WithdrawModal';

// Component Skeleton để hiển thị khi đang tải dữ liệu
const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-custom p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-32"></div>
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
    </div>
  </div>
);

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    walletBalance: 0,
    pendingProducts: 0,
    recentOrders: [] as any[] // Khởi tạo là mảng rỗng
  });
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Hàm để tải dữ liệu từ backend
  const fetchDashboardData = async () => {
      try {
        const response = await getSellerDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan của người bán:", error);
        // Có thể thêm state để hiển thị lỗi
      } finally {
        setIsLoading(false);
      }
    };

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    fetchDashboardData();
  }, [user]);
  
  const getOrderStatusText = (status: string) => ({ completed: 'Hoàn thành', processing: 'Đang xử lý', paid: 'Đã thanh toán', cancelled: 'Đã hủy', pending: 'Chờ xử lý', disputed: 'Khiếu nại' }[status] || status);
  const getOrderStatusColor = (status: string) => ({ completed: 'text-success-600 bg-success-50', processing: 'text-accent-600 bg-accent-50', paid: 'text-blue-600 bg-blue-50', cancelled: 'text-error-600 bg-error-50', pending: 'text-warning-600 bg-warning-50', disputed: 'text-red-600 bg-red-50' }[status] || 'text-gray-600 bg-gray-50');

  if (isLoading) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                 <div className="h-10 bg-gray-300 rounded w-28 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
        </div>
    )
  }

  return (
    <>
      <WithdrawModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        currentBalance={stats.walletBalance}
        onSuccess={() => {
            setIsWithdrawModalOpen(false);
            fetchDashboardData(); // Tải lại dữ liệu sau khi yêu cầu thành công
        }}
      />
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold">Tổng quan người bán</h1>
                <p className="text-gray-600 mt-1">Chào mừng quay trở lại, {user?.name || 'người bán'}</p>
            </div>
            {/* Nút Rút tiền */}
            <button 
              onClick={() => setIsWithdrawModalOpen(true)} 
              className="btn btn-primary flex items-center w-full sm:w-auto shrink-0"
            >
                <Send size={18} className="mr-2" />
                Rút tiền
            </button>
        </div>
        
        {/* Các thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-medium text-gray-500">Số dư ví</h3><p className="text-2xl font-semibold">{formatCurrency(stats.walletBalance)}</p></div><div className="p-3 rounded-full bg-success-100 text-success-600"><DollarSign size={24} /></div></div></div>
            <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-medium text-gray-500">Tổng sản phẩm</h3><p className="text-2xl font-semibold">{stats.totalProducts}</p></div><div className="p-3 rounded-full bg-primary-100 text-primary-600"><Package size={24} /></div></div></div>
            <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3><p className="text-2xl font-semibold">{stats.totalSales}</p></div><div className="p-3 rounded-full bg-secondary-100 text-secondary-600"><ShoppingCart size={24} /></div></div></div>
            <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3><p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p></div><div className="p-3 rounded-full bg-accent-100 text-accent-600"><BarChart size={24} /></div></div></div>
        </div>
        
        {/* Phần Hành động và Đơn hàng gần đây */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hành động đang chờ */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-custom p-6">
                 <h2 className="text-lg font-semibold mb-4">Hành động đang chờ</h2>
                 <Link to="/nguoi-ban/san-pham?status=pending_approval" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                    <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mr-3"><Clock size={20} /></div><div><h3 className="font-medium">Sản phẩm chờ duyệt</h3><p className="text-sm text-gray-600">{stats.pendingProducts} sản phẩm</p></div></div><ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
                </Link>
            </div>
            {/* Đơn hàng gần đây */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-custom p-6">
                <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
                {stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto"><table className="min-w-full"><thead className="border-b"><tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã đơn</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày đặt</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                    </tr></thead><tbody className="divide-y divide-gray-200">{stats.recentOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600 hover:underline"><Link to={`/nguoi-ban/don-hang/${order.id}`}>#{order.id}</Link></td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                            <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>{getOrderStatusText(order.status)}</span></td>
                        </tr>
                    ))}</tbody></table></div>
                ) : (<p className="text-gray-500 text-center py-8">Không có đơn hàng nào gần đây</p>)}
                <div className="mt-4 text-right"><Link to="/nguoi-ban/don-hang" className="text-primary-600 hover:text-primary-700 flex items-center justify-end text-sm font-medium">Xem tất cả đơn hàng <ArrowRight size={16} className="ml-1" /></Link></div>
            </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
