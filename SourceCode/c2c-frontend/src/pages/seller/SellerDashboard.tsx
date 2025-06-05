import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, BarChart, ShoppingCart, TrendingUp, TrendingDown, Clock, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const SellerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingProducts: 0,
    wallet: {
      balance: 0,
      pending: 0,
      withdrawn: 0
    },
    recentOrders: []
  });

  useEffect(() => {
    // Giả lập API call
    const fetchStats = () => {
      setIsLoading(true);
      setTimeout(() => {
        setStats({
          totalProducts: 32,
          totalSales: 156,
          totalRevenue: 24500000,
          activeProducts: 28,
          pendingProducts: 4,
          wallet: {
            balance: 17800000,
            pending: 2350000,
            withdrawn: 4350000
          },
          recentOrders: [
            { id: 'DH123456', date: '15/05/2024', amount: 550000, status: 'completed' },
            { id: 'DH123455', date: '14/05/2024', amount: 1200000, status: 'processing' },
            { id: 'DH123454', date: '12/05/2024', amount: 350000, status: 'completed' },
            { id: 'DH123453', date: '10/05/2024', amount: 850000, status: 'completed' },
            { id: 'DH123452', date: '08/05/2024', amount: 1500000, status: 'cancelled' }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-success-600 bg-success-50';
      case 'processing': return 'text-accent-600 bg-accent-50';
      case 'cancelled': return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <Check size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'cancelled': return <AlertTriangle size={16} />;
      default: return null;
    }
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
        <h1 className="text-2xl font-bold">Tổng quan người bán</h1>
        <p className="text-gray-600 mt-1">Chào mừng quay trở lại, hôm nay là ngày 15/05/2024</p>
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
              5%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
              <ShoppingCart size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
              <p className="text-2xl font-semibold">{stats.totalSales}</p>
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
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <BarChart size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
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
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Số dư ví</h3>
              <p className="text-2xl font-semibold">{formatCurrency(stats.wallet.balance)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-warning-600">
              {formatCurrency(stats.wallet.pending)} chờ xác nhận
            </span>
          </div>
        </div>
      </div>

      {/* Product Status & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Trạng thái sản phẩm</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center text-success-600 mr-3">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Sản phẩm hoạt động</h3>
                  <p className="text-sm text-gray-600">{stats.activeProducts} sản phẩm</p>
                </div>
              </div>
              <Link to="/nguoi-ban/san-pham?status=active" className="text-primary-600 hover:text-primary-700">
                Xem
              </Link>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mr-3">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Sản phẩm chờ duyệt</h3>
                  <p className="text-sm text-gray-600">{stats.pendingProducts} sản phẩm</p>
                </div>
              </div>
              <Link to="/nguoi-ban/san-pham?status=pending" className="text-primary-600 hover:text-primary-700">
                Xem
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Link 
              to="/nguoi-ban/san-pham/them-moi" 
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Package size={18} className="mr-2" />
              Thêm sản phẩm mới
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
          
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentOrders.map((order: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {order.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusIcon(order.status)}
                          <span className="ml-1">{getOrderStatusText(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/nguoi-ban/don-hang/${order.id}`} className="text-primary-600 hover:text-primary-900">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có đơn hàng nào gần đây</p>
          )}
          
          <div className="mt-4 text-right">
            <Link 
              to="/nguoi-ban/don-hang" 
              className="text-primary-600 hover:text-primary-700 flex items-center justify-end text-sm font-medium"
            >
              Xem tất cả đơn hàng
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Ví của tôi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-primary-700">Số dư khả dụng</h3>
              <DollarSign size={18} className="text-primary-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.wallet.balance)}</p>
          </div>
          
          <div className="bg-accent-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-accent-700">Chờ xác nhận</h3>
              <Clock size={18} className="text-accent-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.wallet.pending)}</p>
          </div>
          
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-secondary-700">Đã rút</h3>
              <TrendingDown size={18} className="text-secondary-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.wallet.withdrawn)}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/nguoi-ban/vi" className="btn btn-primary flex-1 flex items-center justify-center">
            <DollarSign size={18} className="mr-2" />
            Quản lý ví
          </Link>
          
          <Link to="/nguoi-ban/vi/rut-tien" className="btn btn-outline flex-1 flex items-center justify-center">
            Rút tiền
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;