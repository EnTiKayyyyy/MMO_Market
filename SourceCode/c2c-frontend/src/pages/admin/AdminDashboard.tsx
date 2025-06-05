import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, Users, CreditCard, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeProducts: 0,
    activeSellers: 0
  });

  useEffect(() => {
    // Giả lập API call để lấy thống kê
    const fetchStats = () => {
      setIsLoading(true);
      // Giả lập dữ liệu thống kê
      setTimeout(() => {
        setStats({
          totalProducts: 845,
          totalUsers: 1247,
          totalOrders: 3689,
          totalRevenue: 87520000,
          pendingApprovals: 24,
          activeProducts: 756,
          activeSellers: 132
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-1">Chào mừng quay trở lại, Quản trị viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Package size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tổng sản phẩm</h3>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              12%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tổng người dùng</h3>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              8%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <BarChart3 size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-error-600 flex items-center">
              <TrendingDown size={16} className="mr-1" />
              3%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <CreditCard size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Doanh thu</h3>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              15%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>
      </div>

      {/* Pending Actions & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Hành động đang chờ</h2>
          
          <div className="space-y-4">
            <Link to="/quan-tri/san-pham?status=pending" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sản phẩm chờ duyệt</h3>
                  <p className="text-sm text-gray-600">Cần phê duyệt {stats.pendingApprovals} sản phẩm</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            
            <Link to="/quan-tri/khieu-nai" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center text-error-600 mr-3">
                  <span className="text-lg font-semibold">12</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Khiếu nại cần xử lý</h3>
                  <p className="text-sm text-gray-600">12 khiếu nại đang chờ xử lý</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            
            <Link to="/quan-tri/rut-tien" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mr-3">
                  <span className="text-lg font-semibold">8</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Yêu cầu rút tiền</h3>
                  <p className="text-sm text-gray-600">8 yêu cầu rút tiền đang chờ duyệt</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-custom p-6">
            <h2 className="text-lg font-semibold mb-4">Tổng quan hoạt động</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Sản phẩm hoạt động</h3>
                <p className="text-2xl font-semibold">{stats.activeProducts}</p>
                <div className="mt-2 text-xs text-success-600">+14 so với tuần trước</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Người bán tích cực</h3>
                <p className="text-2xl font-semibold">{stats.activeSellers}</p>
                <div className="mt-2 text-xs text-success-600">+7 so với tuần trước</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tỷ lệ chuyển đổi</h3>
                <p className="text-2xl font-semibold">4.8%</p>
                <div className="mt-2 text-xs text-error-600">-0.2% so với tuần trước</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Phân bố danh mục</h3>
              <div className="h-12 bg-gray-200 rounded-lg overflow-hidden flex">
                <div style={{ width: '35%' }} className="bg-primary-500 h-full"></div>
                <div style={{ width: '25%' }} className="bg-secondary-500 h-full"></div>
                <div style={{ width: '20%' }} className="bg-accent-500 h-full"></div>
                <div style={{ width: '12%' }} className="bg-error-500 h-full"></div>
                <div style={{ width: '8%' }} className="bg-gray-500 h-full"></div>
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-1"></div>
                  <span>Facebook (35%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-secondary-500 rounded-full mr-1"></div>
                  <span>Spotify (25%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent-500 rounded-full mr-1"></div>
                  <span>Proxy (20%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-error-500 rounded-full mr-1"></div>
                  <span>VPS (12%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                  <span>Khác (8%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="bg-white rounded-lg shadow-custom p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/quan-tri/san-pham" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors flex flex-col items-center justify-center text-center">
            <Package size={24} className="text-primary-600 mb-2" />
            <span className="font-medium">Quản lý sản phẩm</span>
          </Link>
          
          <Link to="/quan-tri/don-hang" className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors flex flex-col items-center justify-center text-center">
            <BarChart3 size={24} className="text-secondary-600 mb-2" />
            <span className="font-medium">Quản lý đơn hàng</span>
          </Link>
          
          <Link to="/quan-tri/nguoi-dung" className="p-4 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors flex flex-col items-center justify-center text-center">
            <Users size={24} className="text-accent-600 mb-2" />
            <span className="font-medium">Quản lý người dùng</span>
          </Link>
          
          <Link to="/quan-tri/cai-dat" className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex flex-col items-center justify-center text-center">
            <CreditCard size={24} className="text-gray-600 mb-2" />
            <span className="font-medium">Cài đặt hệ thống</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;