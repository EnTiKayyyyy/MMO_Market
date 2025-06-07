import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { getMyProducts } from '../../services/sellerService';
import type { SellerProduct } from '../../services/sellerService';
import { useAuthStore } from '../../stores/authStore';

// URL cơ sở của backend để hiển thị hình ảnh
const API_URL = 'http://localhost:3000'; 

const SellerProducts = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
      status: 'all', // Lọc theo trạng thái, 'all' là mặc định
      search: '',   // Lọc theo từ khóa tìm kiếm
  });

  // useEffect sẽ chạy mỗi khi user hoặc bộ lọc (filter) thay đổi
  useEffect(() => {
    // Chỉ chạy khi đã có thông tin người dùng
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = {
            search: filter.search || undefined,
            // Nếu filter.status là 'all', không gửi tham số này lên backend
            status: filter.status === 'all' ? undefined : filter.status,
            // Thêm các tham số phân trang nếu cần
            // page: 1,
            // limit: 10,
        };
        const response = await getMyProducts(params);
        setProducts(response.products || []);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm của người bán:', error);
        // Có thể thêm state để hiển thị thông báo lỗi cho người dùng
      } finally {
        setIsLoading(false);
      }
    };

    // Sử dụng debounce để tránh gọi API liên tục khi người dùng gõ tìm kiếm
    const debounceTimeout = setTimeout(() => {
        fetchProducts();
    }, 500); // Chờ 500ms sau khi người dùng ngừng gõ rồi mới gọi API

    return () => clearTimeout(debounceTimeout); // Hủy timeout nếu người dùng gõ tiếp
  }, [user, filter]);

  // Các hàm helper để hiển thị trạng thái sản phẩm
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      available: 'text-success-600 bg-success-50',
      pending_approval: 'text-warning-600 bg-warning-50',
      delisted: 'text-error-600 bg-error-50',
      sold: 'text-gray-600 bg-gray-100',
    };
    return statusMap[status] || 'text-gray-500';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_approval: 'Chờ duyệt',
      available: 'Đang bán',
      sold: 'Đã bán',
      delisted: 'Đã gỡ bán',
    };
    return statusMap[status] || 'Không xác định';
  };
  
  const handleDelete = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.')) {
      // TODO: Gọi API xóa sản phẩm ở đây
      console.log('Delete product:', productId);
      // Sau khi xóa thành công, gọi lại API để cập nhật danh sách
      // fetchProducts();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm trong cửa hàng của bạn.</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="input pr-10 appearance-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Đang bán</option>
                <option value="pending_approval">Chờ duyệt</option>
                <option value="sold">Đã bán</option>
                <option value="delisted">Đã gỡ bán</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <Link to="/nguoi-ban/san-pham/them-moi" className="btn btn-primary flex items-center shrink-0">
              <Plus size={20} className="mr-2" />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.thumbnail_url ? `${API_URL}${product.thumbnail_url}` : 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(parseFloat(product.price))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/nguoi-ban/san-pham/${product.id}/chinh-sua`} className="text-primary-600 hover:text-primary-900" title="Chỉnh sửa"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(product.id)} className="text-error-600 hover:text-error-900" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter.search || filter.status !== 'all' ? 'Không tìm thấy sản phẩm nào khớp với bộ lọc.' : 'Hãy bắt đầu bằng cách thêm sản phẩm mới vào cửa hàng của bạn.'}
            </p>
            <div className="mt-6">
              <Link to="/nguoi-ban/san-pham/them-moi" className="btn btn-primary inline-flex items-center">
                <Plus size={20} className="mr-2" />
                Thêm sản phẩm mới
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
