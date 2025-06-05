import { useState, useEffect } from 'react';
import { AlertCircle, Search, Filter, ChevronDown, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface Complaint {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  type: 'order' | 'product' | 'payment' | 'other';
  subject: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderId?: string;
  priority: 'low' | 'medium' | 'high';
}

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    // Giả lập API call
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockComplaints: Complaint[] = [
            {
              id: 'KN123456',
              createdAt: '2024-03-15T08:30:00Z',
              status: 'pending',
              type: 'order',
              subject: 'Không nhận được sản phẩm',
              description: 'Tôi đã thanh toán nhưng chưa nhận được thông tin sản phẩm',
              user: {
                id: '1',
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com'
              },
              orderId: 'DH123456',
              priority: 'high'
            },
            {
              id: 'KN123455',
              createdAt: '2024-03-14T10:15:00Z',
              status: 'processing',
              type: 'payment',
              subject: 'Lỗi thanh toán',
              description: 'Tiền đã bị trừ nhưng đơn hàng không được xác nhận',
              user: {
                id: '2',
                name: 'Trần Thị B',
                email: 'tranthib@example.com'
              },
              orderId: 'DH123455',
              priority: 'medium'
            }
          ];
          setComplaints(mockComplaints);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [filter]);

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'resolved':
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

  const getStatusText = (status: Complaint['status']) => {
    switch (status) {
      case 'resolved':
        return 'Đã giải quyết';
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

  const getPriorityColor = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-error-600 bg-error-50';
      case 'medium':
        return 'text-warning-600 bg-warning-50';
      case 'low':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Không xác định';
    }
  };

  const handleResolve = (complaintId: string) => {
    // Implement resolve logic
    console.log('Resolve complaint:', complaintId);
  };

  const handleReject = (complaintId: string) => {
    // Implement reject logic
    console.log('Reject complaint:', complaintId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
        <p className="text-gray-600 mt-1">Xử lý các khiếu nại từ người dùng</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm khiếu nại..."
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
              <option value="resolved">Đã giải quyết</option>
              <option value="rejected">Từ chối</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          <div className="relative">
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="input pr-10 appearance-none"
            >
              <option value="">Tất cả loại</option>
              <option value="order">Đơn hàng</option>
              <option value="product">Sản phẩm</option>
              <option value="payment">Thanh toán</option>
              <option value="other">Khác</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          <div className="relative">
            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              className="input pr-10 appearance-none"
            >
              <option value="">Tất cả mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Complaints List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã khiếu nại
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức độ
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
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{complaint.user.name}</div>
                      <div className="text-sm text-gray-500">{complaint.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                      {complaint.orderId && (
                        <div className="text-sm text-primary-600 mt-1">
                          Đơn hàng: {complaint.orderId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {getPriorityText(complaint.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleResolve(complaint.id)}
                          className="text-success-600 hover:text-success-900"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(complaint.id)}
                          className="text-error-600 hover:text-error-900"
                        >
                          <XCircle size={18} />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có khiếu nại nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hiện tại không có khiếu nại nào cần xử lý.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;