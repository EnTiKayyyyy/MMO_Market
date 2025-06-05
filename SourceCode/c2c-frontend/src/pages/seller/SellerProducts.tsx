import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter, ChevronDown, Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'pending' | 'rejected';
  inStock: number;
  sold: number;
  createdAt: string;
  thumbnail: string;
}

const SellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Giả lập API call để lấy danh sách sản phẩm
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Giả lập dữ liệu
        setTimeout(() => {
          const mockProducts: Product[] = [
            {
              id: '1',
              name: 'Tài khoản Facebook BM đã Verify',
              price: 1200000,
              status: 'active',
              inStock: 15,
              sold: 85,
              createdAt: '2024-03-15',
              thumbnail: 'https://images.pexels.com/photos/5849592/pexels-photo-5849592.jpeg'
            },
            {
              id: '2',
              name: 'Gói Spotify Premium 1 năm',
              price: 250000,
              status: 'pending',
              inStock: 200,
              sold: 0,
              createdAt: '2024-03-14',
              thumbnail: 'https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg'
            },
            {
              id: '3',
              name: 'Proxy Private IPv4',
              price: 500000,
              status: 'rejected',
              inStock: 50,
              sold: 0,
              createdAt: '2024-03-13',
              thumbnail: 'https://images.pexels.com/photos/60626/pexels-photo-60626.jpeg'
            }
          ];
          setProducts(mockProducts);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      case 'rejected':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang bán';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      // Xử lý xóa sản phẩm
      console.log('Delete product:', productId);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm của bạn</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        {/* Actions bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input pr-10 appearance-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Bị từ chối</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <Link to="/nguoi-ban/san-pham/them-moi" className="btn btn-primary flex items-center">
              <Plus size={20} className="mr-2" />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Products table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kho hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.thumbnail}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.inStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/nguoi-ban/san-pham/${product.id}/chinh-sua`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-error-600 hover:text-error-900"
                        >
                          <Trash2 size={18} />
                        </button>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách thêm sản phẩm mới vào cửa hàng của bạn.
            </p>
            <div className="mt-6">
              <Link
                to="/nguoi-ban/san-pham/them-moi"
                className="btn btn-primary"
              >
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