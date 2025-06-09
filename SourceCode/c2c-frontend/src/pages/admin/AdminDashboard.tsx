import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, Users, CreditCard, ArrowRight, ShoppingCart, DollarSign } from 'lucide-react'; // Thêm icon
import { getAdminDashboardStats } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducts: 0,
    pendingOrders: 0,
    pendingPayouts: 0, // Thêm state mới
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await getAdminDashboardStats();
        setStats(response.data); 
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan (admin):", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Tổng quan hệ thống</h1><p className="text-gray-600 mt-1">Chào mừng quay trở lại, Quản trị viên</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center"><div className="p-3 rounded-full bg-primary-100 text-primary-600"><Package size={24} /></div><div className="ml-4"><h3 className="text-sm font-medium text-gray-500">Tổng sản phẩm</h3><p className="text-2xl font-semibold">{stats.totalProducts}</p></div></div></div>
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center"><div className="p-3 rounded-full bg-secondary-100 text-secondary-600"><Users size={24} /></div><div className="ml-4"><h3 className="text-sm font-medium text-gray-500">Tổng người dùng</h3><p className="text-2xl font-semibold">{stats.totalUsers}</p></div></div></div>
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center"><div className="p-3 rounded-full bg-accent-100 text-accent-600"><BarChart3 size={24} /></div><div className="ml-4"><h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3><p className="text-2xl font-semibold">{stats.totalOrders}</p></div></div></div>
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center"><div className="p-3 rounded-full bg-success-100 text-success-600"><CreditCard size={24} /></div><div className="ml-4"><h3 className="text-sm font-medium text-gray-500">Doanh thu</h3><p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p></div></div></div>
      </div>
      
      <div className="bg-white rounded-lg shadow-custom p-6 lg:col-span-1">
        <h2 className="text-lg font-semibold mb-4">Hành động đang chờ</h2>
        <div className="space-y-4">
            <Link to="/quan-tri/san-pham?status=pending_approval" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3"><Package size={20} /></div><div><h3 className="font-medium text-gray-900">Sản phẩm chờ duyệt</h3><p className="text-sm text-gray-600">{stats.pendingProducts} sản phẩm đang chờ</p></div></div><ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
            </Link>

            <Link to="/quan-tri/don-hang?status=paid" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 mr-3">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Đơn hàng chờ xử lý</h3>
                        <p className="text-sm text-gray-600">{stats.pendingOrders} đơn hàng đang chờ</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
            </Link>

            {/* THÊM MỚI: Thẻ Yêu cầu rút tiền */}
            <Link to="/quan-tri/rut-tien" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center text-success-600 mr-3">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Yêu cầu rút tiền</h3>
                        <p className="text-sm text-gray-600">{stats.pendingPayouts} yêu cầu đang chờ</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
