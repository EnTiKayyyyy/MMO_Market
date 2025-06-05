import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface Withdrawal {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  amount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    // Giả lập API call
    const fetchWithdrawals = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockWithdrawals: Withdrawal[] = [
            {
              id: 'RT123456',
              createdAt: '2024-03-15T08:30:00Z',
              status: 'pending',
              amount: 5000000,
              user: {
                id: '1',
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com'
              },
              bankInfo: {
                bankName: 'Vietcombank',
                accountNumber: '1234567890',
                accountName: 'NGUYEN VAN A'
              }
            },
            {
              id: 'RT123455',
              createdAt: '2024-03-14T10:15:00Z',
              status: 'completed',
              amount: 2000000,
              user: {
                id: '2',
                name: 'Trần Thị B',
                email: 'tranthib@example.com'
              },
              bankInfo: {
                bankName: 'Techcombank',
                accountNumber: '0987654321',
                accountName: 'TRAN THI B'
              }
            }
          ];
          setWithdrawals(mockWithdrawals);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
        setIsLoading(false);
      }
    };

    fetchWithdrawals();
  }, [filter]);

  const getStatusColor = (status: Withdrawal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50';
      case 'processing':
        return 'text-accent-600 bg-accent-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      case 'rejected':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Withdrawal['status']) => {
    switch (status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xử lý';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  };

  const handleApprove = (withdrawalId: string) => {
    // Implement approve logic
    console.log('Approve withdrawal:', withdrawalId);
  };

  const handleReject = (withdrawalId: string) => {
    // Implement reject logic
    console.log('Reject withdrawal:', withdrawalId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý yêu cầu rút tiền</h1>
        <p className="text-gray-600 mt-1">Xử lý các yêu cầu rút tiền từ người bán</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm yêu cầu..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="input pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="input pr-10 appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Đã thanh toán</option>
              <option value="rejected">Từ chối</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Withdrawals List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã yêu cầu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người yêu cầu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin ngân hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {withdrawal.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{withdrawal.user.name}</div>
                      <div className="text-sm text-gray-500">{withdrawal.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{withdrawal.bankInfo.bankName}</div>
                        <div className="text-gray-500">{withdrawal.bankInfo.accountNumber}</div>
                        <div className="text-gray-500">{withdrawal.bankInfo.accountName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(withdrawal.id)}
                              className="text-success-600 hover:text-success-900"
                              title="Duyệt yêu cầu"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(withdrawal.id)}
                              className="text-error-600 hover:text-error-900"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu rút tiền</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hiện tại không có yêu cầu rút tiền nào cần xử lý.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;