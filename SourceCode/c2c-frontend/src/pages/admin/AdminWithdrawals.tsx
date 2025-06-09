import { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle, DollarSign, QrCode, X } from 'lucide-react'; // Thêm icon QrCode và X
import { formatCurrency, formatDateTime } from '../../utils/format';
import { adminGetPayouts, adminProcessPayout } from '../../services/adminService';
import type { AdminWithdrawal } from '../../services/adminService';

// Component QR Code Modal
const QrCodeModal = ({ withdrawal, onClose }: { withdrawal: AdminWithdrawal | null, onClose: () => void }) => {
    if (!withdrawal) return null;

    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (withdrawal) {
            try {
                const bankInfo = JSON.parse(withdrawal.payout_info);
                const amount = parseFloat(withdrawal.amount.toString());
                const description = `CK YC ${withdrawal.id} cho ${withdrawal.seller.username}`;

                // Ánh xạ một số tên ngân hàng phổ biến sang mã BIN của VietQR
                const bankBinMap: { [key: string]: string } = {
                    'vietcombank': '970436', 'vcb': '970436',
                    'techcombank': '970407', 'tcb': '970407',
                    'acb': '970416', 'á châu': '970416',
                    'mbbank': '970422', 'mb': '970422',
                    'bidv': '970418',
                    'vietinbank': '970415', 'ctg': '970415',
                    'agribank': '970405',
                    'vpbank': '970432',
                    'sacombank': '970403',
                };
                
                const bankKey = bankInfo.bankName.toLowerCase().replace(/[^a-z0-9]/gi, '');
                const bankBin = bankBinMap[bankKey];

                if (!bankBin) {
                    setError(`Không tìm thấy mã BIN cho ngân hàng "${bankInfo.bankName}". Vui lòng kiểm tra lại tên ngân hàng.`);
                    return;
                }
                
                // Tạo URL cho API của VietQR
                const url = `https://img.vietqr.io/image/${bankBin}-${bankInfo.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
                setQrCodeUrl(url);
                setError(null);
            } catch (e) {
                console.error("Lỗi khi phân tích thông tin thanh toán:", e);
                setError("Thông tin thanh toán của yêu cầu này không hợp lệ, không thể tạo mã QR.");
            }
        }
    }, [withdrawal]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Quét QR để thanh toán</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                {error ? (
                    <div className="bg-error-50 text-error-700 p-4 rounded-lg">{error}</div>
                ) : qrCodeUrl ? (
                    <>
                        <img src={qrCodeUrl} alt="VietQR Code" className="mx-auto border-4 border-white rounded-lg shadow-lg" />
                        <div className="mt-4 text-left bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                             <p><strong>Người nhận:</strong> {JSON.parse(withdrawal.payout_info).accountName}</p>
                             <p><strong>Số tiền:</strong> <span className="font-bold text-primary-600">{formatCurrency(parseFloat(withdrawal.amount.toString()))}</span></p>
                             <p><strong>Nội dung:</strong> {`CK YC ${withdrawal.id} cho ${withdrawal.seller.username}`}</p>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận giao dịch.</p>
                    </>
                ) : (
                    <div className="animate-pulse">Đang tạo mã QR...</div>
                )}
            </div>
        </div>
    );
};


const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [selectedRequest, setSelectedRequest] = useState<AdminWithdrawal | null>(null);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
        const params = {
            status: filter.status || undefined,
            search: filter.search || undefined,
        };
        const response = await adminGetPayouts(params);
        setWithdrawals(response.data.payoutRequests || []);
    } catch (error) {
        console.error('Lỗi khi tải yêu cầu rút tiền:', error);
        setWithdrawals([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
        fetchWithdrawals();
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [filter]);

  const handleProcessRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
      let notes;
      if (newStatus === 'rejected') {
          notes = prompt("Nhập lý do từ chối yêu cầu này:");
          if (notes === null) return;
      }
      
      const confirmAction = window.confirm(`Bạn có chắc chắn muốn "${newStatus === 'approved' ? 'Duyệt và Hoàn thành' : 'Từ chối'}" yêu cầu #${requestId}?`);
      if (!confirmAction) return;

      try {
          await adminProcessPayout(requestId, newStatus, notes || undefined);
          alert("Xử lý yêu cầu thành công!");
          fetchWithdrawals();
      } catch (error: any) {
          alert(`Lỗi khi xử lý yêu cầu: ${error.response?.data?.message || error.message}`);
      }
  }

  const getStatusText = (status: string) => ({ pending: 'Chờ xử lý', processing: 'Đang xử lý', completed: 'Đã thanh toán', rejected: 'Từ chối', failed: 'Thất bại', approved: 'Đã duyệt' }[status] || status);
  const getStatusColor = (status: string) => ({ completed: 'text-success-600 bg-success-50', approved: 'text-blue-600 bg-blue-50', processing: 'text-accent-600 bg-accent-50', pending: 'text-warning-600 bg-warning-50', rejected: 'text-error-600 bg-error-50', failed: 'text-error-600 bg-error-50'}[status] || 'text-gray-600 bg-gray-50');

  return (
    <div>
        {selectedRequest && <QrCodeModal withdrawal={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      <div className="mb-6"><h1 className="text-2xl font-bold">Quản lý yêu cầu rút tiền</h1><p className="text-gray-600 mt-1">Xử lý các yêu cầu rút tiền từ người bán</p></div>
      <div className="bg-white rounded-lg shadow-custom p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative"><input type="text" placeholder="Tìm theo tên hoặc email người bán..." value={filter.search} onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))} className="input pl-10" /><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /></div>
            <div className="relative"><select value={filter.status} onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))} className="input pr-10 appearance-none"><option value="">Tất cả trạng thái</option><option value="pending">Chờ xử lý</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option><option value="failed">Thất bại</option></select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} /></div>
        </div>
        {isLoading ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>)
        : withdrawals.length > 0 ? (<div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã YC</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người yêu cầu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin NH</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{withdrawals.map((withdrawal) => {
                const bankInfo = JSON.parse(withdrawal.payout_info || '{}');
                return (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">#{withdrawal.id}</div><div className="text-xs text-gray-500">{formatDateTime(withdrawal.createdAt)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{withdrawal.seller.username}</div><div className="text-sm text-gray-500">{withdrawal.seller.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(parseFloat(withdrawal.amount.toString()))}</td>
                    <td className="px-6 py-4"><div className="text-sm"><div className="font-medium text-gray-900">{bankInfo.bankName}</div><div className="text-gray-500">{bankInfo.accountNumber}</div><div className="text-gray-500 uppercase">{bankInfo.accountName}</div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>{getStatusText(withdrawal.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end space-x-2">
                        {withdrawal.status === 'pending' && (<>
                            <button onClick={() => setSelectedRequest(withdrawal)} className="text-blue-600 hover:text-blue-900" title="Hiện QR Code"><QrCode size={18} /></button>
                            <button onClick={() => handleProcessRequest(withdrawal.id, 'approved')} className="text-success-600 hover:text-success-900" title="Duyệt và Hoàn thành"><CheckCircle size={18} /></button>
                            <button onClick={() => handleProcessRequest(withdrawal.id, 'rejected')} className="text-error-600 hover:text-error-900" title="Từ chối"><XCircle size={18} /></button>
                        </>)}
                    </div></td>
                </tr>
            )})}</tbody>
            </table>
        </div>)
        : (<div className="text-center py-12"><DollarSign className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu rút tiền</h3><p className="mt-1 text-sm text-gray-500">Hiện tại không có yêu cầu nào khớp với bộ lọc của bạn.</p></div>)}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
