import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { adminGetProducts, adminUpdateProductStatus } from '../../services/adminService';
import type { AdminProduct } from '../../services/adminService';

const AdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', status: 'all' });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: filter.search || undefined,
        status: filter.status === 'all' ? undefined : filter.status,
      };
      const response = await adminGetProducts(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm (admin):", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const handleStatusUpdate = async (productId: string, status: string, notes?: string) => {
    if (status === 'rejected' && !notes) {
        notes = prompt("Vui lòng nhập lý do từ chối:");
        if (!notes) return; // Người dùng hủy
    }
    try {
        await adminUpdateProductStatus(productId, status, notes);
        alert(`Đã cập nhật trạng thái sản phẩm #${productId}`);
        fetchProducts(); // Tải lại danh sách
    } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật trạng thái.");
        console.error(error);
    }
  };

  const getStatusText = (status: string) => ({'pending_approval': 'Chờ duyệt', 'available': 'Đang bán', 'sold': 'Đã bán', 'delisted': 'Đã gỡ bán'}[status] || status);
  const getStatusColor = (status: string) => ({'pending_approval': 'text-warning-600 bg-warning-50', 'available': 'text-success-600 bg-success-50', 'sold': 'text-gray-600 bg-gray-100', 'delisted': 'text-error-600 bg-error-50'}[status] || 'text-gray-500');

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Quản lý sản phẩm</h1><p className="text-gray-600 mt-1">Quản lý và kiểm duyệt sản phẩm trên hệ thống</p></div>
      <div className="bg-white rounded-lg shadow-custom p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1"><div className="relative"><input type="text" placeholder="Tìm kiếm sản phẩm..." value={filter.search} onChange={(e) => setFilter({...filter, search: e.target.value})} className="input pl-10" /><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /></div></div>
          <div className="flex gap-4"><select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})} className="input"><option value="all">Tất cả trạng thái</option><option value="pending_approval">Chờ duyệt</option><option value="available">Đang hoạt động</option><option value="sold">Đã bán</option><option value="delisted">Đã gỡ bán</option></select></div>
        </div>
        {isLoading ? (<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
        : (<div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người bán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="text-gray-500" size={20} /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{product.name}</div><div className="text-sm text-gray-500">ID: {product.id}</div></div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{product.seller.username}</div><div className="text-sm text-gray-500">{product.seller.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">{formatCurrency(parseFloat(product.price))}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>{getStatusText(product.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex items-center justify-end space-x-2">
                        {product.status === 'pending_approval' && <>
                            <button onClick={() => handleStatusUpdate(product.id, 'available')} className="text-success-600 hover:text-success-900" title="Duyệt"><CheckCircle size={18} /></button>
                            <button onClick={() => handleStatusUpdate(product.id, 'rejected')} className="text-error-600 hover:text-error-900" title="Từ chối"><XCircle size={18} /></button>
                        </>}
                        <Link to={`/quan-tri/san-pham/${product.id}/chinh-sua`} className="text-gray-400 hover:text-gray-600" title="Xem chi tiết"><Edit size={18} /></Link>
                    </div></td>
                </tr>
            ))}</tbody>
        </table></div>)}
      </div>
    </div>
  );
};

export default AdminProducts;
