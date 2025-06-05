import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: 'active' | 'pending' | 'rejected';
  seller: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Giả lập API call
    const fetchProducts = () => {
      setIsLoading(true);
      setTimeout(() => {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Facebook BM Verify',
            price: 1200000,
            category: 'Facebook',
            status: 'active',
            seller: {
              name: 'John Doe',
              email: 'john@example.com'
            },
            createdAt: '2024-03-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Spotify Premium',
            price: 250000,
            category: 'Spotify',
            status: 'pending',
            seller: {
              name: 'Jane Smith',
              email: 'jane@example.com'
            },
            createdAt: '2024-03-14T15:45:00Z'
          },
          // Add more mock products as needed
        ];
        setProducts(mockProducts);
        setIsLoading(false);
      }, 1000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý và kiểm duyệt sản phẩm trên hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        {/* Search and Filters */}
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>

            <button className="btn btn-outline flex items-center">
              <Filter size={20} className="mr-2" />
              Lọc
            </button>

            <Link to="/quan-tri/san-pham/them-moi" className="btn btn-primary flex items-center">
              <Plus size={20} className="mr-2" />
              Thêm mới
            </Link>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
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
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="text-gray-500" size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.seller.name}</div>
                    <div className="text-sm text-gray-500">{product.seller.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      <span className="ml-1">
                        {product.status === 'active' && 'Hoạt động'}
                        {product.status === 'pending' && 'Chờ duyệt'}
                        {product.status === 'rejected' && 'Đã từ chối'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/quan-tri/san-pham/${product.id}/chinh-sua`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit size={18} />
                      </Link>
                      <button className="text-error-600 hover:text-error-900">
                        <Trash2 size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">
              Không có sản phẩm nào phù hợp với điều kiện tìm kiếm của bạn
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;