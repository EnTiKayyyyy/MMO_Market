import { useState, useEffect } from 'react';
import { DollarSign, Clock, AlertTriangle, ArrowUp } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useWalletStore } from '../../stores/walletStore';

const BuyerWallet = () => {
  // Lấy các giá trị state và hàm actions từ store
  const { balance, transactions, isLoading, error, fetchWalletData, deposit } = useWalletStore();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Gọi hàm fetchWalletData một lần duy nhất khi component được tải
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isDepositing || Number(depositAmount) < 10000) {
        alert("Số tiền nạp phải ít nhất là 10,000đ.");
        return;
    }

    setIsDepositing(true);
    try {
      // Gọi action `deposit` từ store
      const { paymentUrl } = await deposit(Number(depositAmount));
      // Nếu thành công, điều hướng người dùng đến cổng thanh toán
      window.location.href = paymentUrl;
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi tạo yêu cầu nạp tiền.');
      setIsDepositing(false);
    }
  };

  // Component con để render nội dung chính dựa trên trạng thái
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 bg-red-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-error-500" />
          <h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3>
          <p className="mt-1 text-sm text-error-700">{error}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-custom p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700">Số dư khả dụng</h3>
                    <div className="p-2 rounded-full bg-primary-100 text-primary-600"><DollarSign size={20} /></div>
                </div>
                <p className="text-4xl font-bold text-primary-700">{formatCurrency(balance)}</p>
            </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Nạp tiền vào ví</h2>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn nạp</label>
              <input type="number" id="amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="input" placeholder="Nhập số tiền" min="10000" step="1000" required />
            </div>
            <button type="submit" disabled={isDepositing} className="btn btn-primary w-full flex items-center justify-center">
              {isDepositing ? "Đang xử lý..." : <><ArrowUp size={18} className="mr-2"/> Tiếp tục</>}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-500"><p className="font-semibold">Lưu ý:</p><ul className="list-disc list-inside ml-4"><li>Số tiền nạp tối thiểu là 10,000đ.</li><li>Bạn sẽ được chuyển đến cổng thanh toán an toàn.</li></ul></div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h2>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">{/* Bảng hiển thị giao dịch sẽ ở đây */}</div>
          ) : (
            <div className="text-center py-12 text-gray-500">Chưa có giao dịch nào.</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ví của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý số dư và các giao dịch của bạn</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default BuyerWallet;
