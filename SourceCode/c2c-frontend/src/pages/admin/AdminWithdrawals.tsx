import { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { adminGetPayouts, adminProcessPayout } from '../../services/adminService';
import type { AdminWithdrawal } from '../../services/adminService';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
        const params = {
            status: filter.status || undefined,
            search: filter.search || undefined, // Backend cần hỗ trợ search
        };
        const response = await adminGetPayouts(params);
        setWithdrawals(response.data.payoutRequests);
    } catch (error) {
        console.error('Lỗi khi tải yêu cầu rút tiền:', error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleProcessRequest = async (requestId: string, newStatus: 'completed' | 'rejected') => {
      let notes;
      if (newStatus === 'rejected') {
          notes = prompt("Nhập lý do từ chối:");
          if (!notes) return;
      }
      try {
          await adminProcessPayout(requestId, newStatus, notes);
          alert("Xử lý yêu cầu thành công!");
          fetchWithdrawals();
      } catch (error: any) {
          alert(`Lỗi khi xử lý yêu cầu: ${error.response?.data?.message || error.message}`);
      }
  }

  const getStatusText = (status: string) => ({ pending: 'Chờ xử lý', processing: 'Đang xử lý', completed: 'Đã thanh toán', rejected: 'Từ chối', failed: 'Thất bại', approved: 'Đã duyệt' }[status] || status);
  const getStatusColor = (status: string) => ({ completed: 'text-success-600 bg-success-50', approved: 'text-success-600 bg-success-50', processing: 'text-accent-600 bg-accent-50', pending: 'text-warning-600 bg-warning-50', rejected: 'text-error-600 bg-error-50', failed: 'text-error-600 bg-error-50'}[status] || 'text-gray-600 bg-gray-50');

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Quản lý yêu cầu rút tiền</h1><p className="text-gray-600 mt-1">Xử lý các yêu cầu rút tiền từ người bán</p></div>
      <div className="bg-white rounded-lg shadow-custom p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative"><input type="text" placeholder="Tìm kiếm yêu cầu..." value={filter.search} onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))} className="input pl-10" /><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /></div>
            <div className="relative"><select value={filter.status} onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))} className="input pr-10 appearance-none"><option value="">Tất cả trạng thái</option><option value="pending">Chờ xử lý</option><option value="completed">Đã thanh toán</option><option value="rejected">Từ chối</option></select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} /></div>
        </div>
        {isLoading ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>)
        : withdrawals.length > 0 ? (<div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã YC</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người yêu cầu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin NH</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{withdrawals.map((withdrawal) => {
                const bankInfo = JSON.parse(withdrawal.payout_info || '{}');
                return (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{withdrawal.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{withdrawal.seller.username}</div><div className="text-sm text-gray-500">{withdrawal.seller.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</td>
                    <td className="px-6 py-4"><div className="text-sm"><div className="font-medium text-gray-900">{bankInfo.bankName}</div><div className="text-gray-500">{bankInfo.accountNumber}</div><div className="text-gray-500">{bankInfo.accountName}</div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>{getStatusText(withdrawal.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end space-x-2">
                        {withdrawal.status === 'pending' && (<>
                            <button onClick={() => handleProcessRequest(withdrawal.id, 'completed')} className="text-success-600 hover:text-success-900" title="Duyệt và đánh dấu Hoàn thành"><CheckCircle size={18} /></button>
                            <button onClick={() => handleProcessRequest(withdrawal.id, 'rejected')} className="text-error-600 hover:text-error-900" title="Từ chối"><XCircle size={18} /></button>
                        </>)}
                    </div></td>
                </tr>
            )})}</tbody>
            </table>
        </div>)
        : (<div className="text-center py-12"><DollarSign className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu rút tiền</h3><p className="mt-1 text-sm text-gray-500">Hiện tại không có yêu cầu nào cần xử lý.</p></div>)}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
