import { useState, useEffect } from 'react';
import { DollarSign, Clock, Send, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getMyWallet, getMyPayoutRequests, createPayoutRequest } from '../../services/sellerService';
import type { SellerWallet, PayoutRequest } from '../../services/sellerService';

const SellerWalletPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // State cho form rút tiền
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountName: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm để tải tất cả dữ liệu cần thiết cho trang
  const fetchWalletData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gọi song song 2 API để tăng tốc
        const [walletData, payoutData] = await Promise.all([
            getMyWallet(),
            getMyPayoutRequests()
        ]);
        setWallet(walletData);
        setPayouts(payoutData.payoutRequests || []);
      } catch (err: any) {
          setError(err.response?.data?.message || "Không thể tải dữ liệu ví. Vui lòng thử lại.");
          console.error("Lỗi tải dữ liệu ví:", err);
      } finally {
          setIsLoading(false);
      }
  };

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Xử lý khi gửi form yêu cầu rút tiền
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);

    if (isNaN(amount) || amount < 50000) {
        alert("Số tiền rút tối thiểu là 50,000đ.");
        return;
    }
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
        alert("Vui lòng điền đầy đủ thông tin ngân hàng.");
        return;
    }
    if (wallet && amount > parseFloat(wallet.balance)) {
        alert("Số tiền rút không được lớn hơn số dư khả dụng.");
        return;
    }

    setIsSubmitting(true);
    try {
        await createPayoutRequest(amount, bankInfo);
        alert("Yêu cầu rút tiền của bạn đã được gửi thành công và đang chờ xử lý.");
        setPayoutAmount(''); // Reset form
        fetchWalletData(); // Tải lại dữ liệu mới nhất từ server
    } catch (err: any) {
        alert(`Lỗi khi tạo yêu cầu: ${err.response?.data?.message || err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Các hàm helper để hiển thị trạng thái
  const getStatusText = (status: string) => ({ pending: 'Đang chờ', approved: 'Đã duyệt', rejected: 'Bị từ chối', completed: 'Hoàn thành' }[status] || status);
  const getStatusColor = (status: string) => ({ completed: 'text-success-600 bg-success-50', approved: 'text-blue-600 bg-blue-50', pending: 'text-warning-600 bg-warning-50', rejected: 'text-error-600 bg-error-50'}[status] || 'text-gray-600 bg-gray-50');

  // Render các trạng thái của trang
  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }
  
  if (error) {
      return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertTriangle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{error}</p></div>;
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Ví của tôi</h1><p className="text-gray-600 mt-1">Quản lý số dư và các yêu cầu rút tiền của bạn.</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between mb-2"><h3 className="font-medium text-gray-700">Số dư khả dụng</h3><div className="p-2 rounded-full bg-primary-100 text-primary-600"><DollarSign size={20} /></div></div><p className="text-3xl font-bold">{formatCurrency(parseFloat(wallet?.balance || '0'))}</p></div>
        <div className="bg-white rounded-lg shadow-custom p-6"><div className="flex items-center justify-between mb-2"><h3 className="font-medium text-gray-700">Đang chờ xử lý</h3><div className="p-2 rounded-full bg-warning-100 text-warning-600"><Clock size={20} /></div></div><p className="text-3xl font-bold">{formatCurrency(payouts.filter(p=>p.status === 'pending' || p.status === 'approved').reduce((sum, p) => sum + parseFloat(p.amount), 0))}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form rút tiền */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-custom p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Tạo yêu cầu rút tiền</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
                <div><label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn rút</label><input type="number" id="amount" className="input" placeholder="Tối thiểu 50,000đ" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} min="50000" required /></div>
                <div><label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label><input type="text" id="bankName" className="input" placeholder="VD: Vietcombank" value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} required/></div>
                <div><label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label><input type="text" id="accountNumber" className="input" placeholder="Nhập số tài khoản" value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})} required /></div>
                <div><label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label><input type="text" id="accountName" className="input" placeholder="NGUYEN VAN A" value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})} required /></div>
                <button type="submit" className="btn btn-primary w-full flex items-center justify-center" disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : <><Send size={18} className="mr-2"/>Gửi yêu cầu</>}
                </button>
            </form>
        </div>

        {/* Lịch sử rút tiền */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-custom p-6">
            <h2 className="text-lg font-semibold mb-4">Lịch sử yêu cầu rút tiền</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full"><thead className="border-b"><tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Số tiền</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {payouts.length > 0 ? payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDateTime(payout.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(parseFloat(payout.amount))}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>{getStatusText(payout.status)}</span></td>
                    </tr>
                    )) : (
                    <tr><td colSpan={3} className="text-center text-gray-500 py-8">Chưa có yêu cầu rút tiền nào.</td></tr>
                    )}
                </tbody></table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SellerWalletPage;