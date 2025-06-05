import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowDown, ArrowUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const SellerWallet = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    balance: 0,
    pending: 0,
    withdrawn: 0,
    transactions: []
  });

  useEffect(() => {
    // Giả lập API call
    const fetchWalletData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setWalletData({
          balance: 17800000,
          pending: 2350000,
          withdrawn: 4350000,
          transactions: [
            {
              id: 'TRX123456',
              type: 'deposit',
              amount: 1500000,
              status: 'completed',
              date: '15/05/2024',
              description: 'Thanh toán đơn hàng #DH123456'
            },
            {
              id: 'TRX123455',
              type: 'withdraw',
              amount: 2000000,
              status: 'pending',
              date: '14/05/2024',
              description: 'Rút tiền về tài khoản ngân hàng'
            },
            {
              id: 'TRX123454',
              type: 'deposit',
              amount: 850000,
              status: 'completed',
              date: '12/05/2024',
              description: 'Thanh toán đơn hàng #DH123454'
            },
            {
              id: 'TRX123453',
              type: 'withdraw',
              amount: 3000000,
              status: 'completed',
              date: '10/05/2024',
              description: 'Rút tiền về tài khoản ngân hàng'
            },
            {
              id: 'TRX123452',
              type: 'deposit',
              amount: 1200000,
              status: 'failed',
              date: '08/05/2024',
              description: 'Thanh toán đơn hàng #DH123452'
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchWalletData();
  }, []);

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
        <h1 className="text-2xl font-bold">Ví của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý số dư và giao dịch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Số dư khả dụng</h3>
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(walletData.balance)}</p>
          <div className="mt-2 text-sm text-success-600 flex items-center">
            <ArrowUp size={16} className="mr-1" />
            +12% so với tháng trước
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Đang chờ xử lý</h3>
            <div className="p-2 rounded-full bg-warning-100 text-warning-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(walletData.pending)}</p>
          <div className="mt-2 text-sm text-warning-600">
            2 giao dịch đang chờ xử lý
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Đã rút</h3>
            <div className="p-2 rounded-full bg-secondary-100 text-secondary-600">
              <ArrowDown size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(walletData.withdrawn)}</p>
          <div className="mt-2 text-sm text-gray-600">
            Tổng tiền đã rút trong tháng
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Lịch sử giao dịch</h2>
          <Link to="/nguoi-ban/vi/lich-su" className="text-primary-600 hover:text-primary-700">
            Xem tất cả
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {walletData.transactions.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {transaction.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
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
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        <h2 className="text-lg font-semibold mb-4">Rút tiền</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền muốn rút
            </label>
            <input
              type="number"
              id="amount"
              className="input"
              placeholder="Nhập số tiền"
            />
          </div>

          <div>
            <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">
              Tài khoản ngân hàng
            </label>
            <select id="bank" className="input">
              <option value="">Chọn tài khoản ngân hàng</option>
              <option value="1">Vietcombank - **** 1234</option>
              <option value="2">Techcombank - **** 5678</option>
            </select>
          </div>

          <button className="btn btn-primary w-full">
            Rút tiền
          </button>

          <p className="text-sm text-gray-500 mt-2">
            Lưu ý: Thời gian xử lý rút tiền từ 1-3 ngày làm việc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerWallet;