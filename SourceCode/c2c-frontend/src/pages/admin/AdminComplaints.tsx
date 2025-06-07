import { useState, useEffect } from 'react';
import { AlertCircle, Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { adminGetDisputes, adminResolveDispute } from '../../services/adminService';
import type { AdminComplaint } from '../../services/adminService';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
        const params = { status: filter.status || undefined };
        const response = await adminGetDisputes(params);
        setComplaints(response.data.disputes);
    } catch (error) {
        console.error('Lỗi khi tải khiếu nại:', error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const handleResolve = async (disputeId: string, resolution: 'resolved_refund_buyer' | 'resolved_favor_seller') => {
      const notes = prompt(`Nhập ghi chú giải quyết cho trạng thái "${resolution}":`);
      if (!notes) return;
      try {
          await adminResolveDispute(disputeId, resolution, notes);
          alert("Giải quyết khiếu nại thành công!");
          fetchComplaints();
      } catch (error: any) {
          alert(`Lỗi khi giải quyết khiếu nại: ${error.response?.data?.message || error.message}`);
      }
  };

  const getStatusText = (status: string) => ({ open: 'Mới mở', seller_responded: 'Bên bán đã phản hồi', buyer_rebutted: 'Bên mua đã phản hồi', under_admin_review: 'Đang xem xét', resolved_refund_buyer: 'Hoàn tiền cho người mua', resolved_favor_seller: 'Thiên vị người bán', closed_without_action: 'Đóng' }[status] || status);
  const getStatusColor = (status: string) => ({ resolved_refund_buyer: 'text-success-600 bg-success-50', resolved_favor_seller: 'text-blue-600 bg-blue-50', open: 'text-warning-600 bg-warning-50'}[status] || 'text-gray-600 bg-gray-50');

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Quản lý khiếu nại</h1><p className="text-gray-600 mt-1">Xử lý các khiếu nại từ người dùng</p></div>
      <div className="bg-white rounded-lg shadow-custom p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative"><input type="text" placeholder="Tìm kiếm khiếu nại..." className="input pl-10" /><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /></div>
          <div className="relative"><select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="input pr-10 appearance-none"><option value="">Tất cả trạng thái</option><option value="open">Mới mở</option><option value="under_admin_review">Đang xem xét</option></select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} /></div>
        </div>
        {isLoading ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>)
        : complaints.length > 0 ? (<div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã KN</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người khiếu nại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bị khiếu nại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{complaint.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{complaint.complainant.username}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{complaint.defendant.username}</div></td>
                    <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{complaint.orderItem.product.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>{getStatusText(complaint.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end space-x-2">
                        <button onClick={() => handleResolve(complaint.id, 'resolved_favor_seller')} className="text-success-600 hover:text-success-900" title="Thiên vị người bán"><CheckCircle size={18} /></button>
                        <button onClick={() => handleResolve(complaint.id, 'resolved_refund_buyer')} className="text-error-600 hover:text-error-900" title="Hoàn tiền cho người mua"><XCircle size={18} /></button>
                    </div></td>
                </tr>))}
            </tbody></table>
        </div>)
        : (<div className="text-center py-12"><AlertCircle className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Không có khiếu nại nào</h3><p className="mt-1 text-sm text-gray-500">Hiện tại không có khiếu nại nào cần xử lý.</p></div>)}
      </div>
    </div>
  );
};

export default AdminComplaints;
