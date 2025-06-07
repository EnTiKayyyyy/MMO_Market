import { useState, useEffect } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useWalletStore } from '../../stores/walletStore';
import { createVnpayDepositUrl } from '../../services/walletService'; // Import hàm mới

const BuyerWallet = () => {
  const { balance, transactions, isLoading: isWalletLoading, fetchWalletData } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isSubmitting) return;

    const amount = Number(depositAmount);
    if (isNaN(amount) || amount < 10000) {
        alert("Số tiền nạp tối thiểu là 10,000đ.");
        return;
    }

    setIsSubmitting(true);
    try {
      const response = await createVnpayDepositUrl(amount);
      // Chuyển hướng người dùng đến cổng thanh toán VNPay
      window.location.href = response.paymentUrl;
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo yêu cầu nạp tiền. Vui lòng thử lại.');
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-success-600 bg-success-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      case 'failed': return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
      default: return 'Không xác định';
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'failed': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ví của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý số dư và giao dịch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Số dư khả dụng</h3>
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">{isWalletLoading ? '...' : formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nạp tiền */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-custom p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Nạp tiền qua VNPay</h2>
          <form onSubmit={handleDeposit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền muốn nạp
              </label>
              <input
                type="number"
                id="amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="input"
                placeholder="Tối thiểu 10,000đ"
                min="10000"
                step="10000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!depositAmount || isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục với VNPay'}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p>Lưu ý:</p>
            <ul className="list-disc list-inside">
              <li>Bạn sẽ được chuyển đến cổng thanh toán VNPay.</li>
              <li>Giao dịch được xử lý an toàn và bảo mật.</li>
            </ul>
          </div>
        </div>

        {/* Lịch sử giao dịch */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h2>
          
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center text-sm ${
                          transaction.type === 'deposit'
                            ? 'text-success-600'
                            : transaction.type === 'withdraw'
                            ? 'text-error-600'
                            : 'text-gray-600'
                        }`}>
                          {transaction.type === 'deposit' && <ArrowUp size={16} className="mr-1" />}
                          {transaction.type === 'withdraw' && <ArrowDown size={16} className="mr-1" />}
                          {transaction.type === 'deposit' ? 'Nạp tiền' : transaction.type === 'withdraw' ? 'Rút tiền' : 'Thanh toán'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'deposit' ? 'text-success-600' : 'text-error-600'}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                          {getTransactionStatusIcon(transaction.status)}
                          <span className="ml-1">{getTransactionStatusText(transaction.status)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có giao dịch nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerWallet;