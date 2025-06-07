import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, Key, Copy, User, AlertCircle, Eye, AlertTriangle } from 'lucide-react';
import api from '../../api'; // Import api instance
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getOrderById, getOrderItemProductData } from '../../services/orderService';
import type { Order } from '../../services/orderService';

const API_URL = 'http://localhost:3000';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedData, setRevealedData] = useState<Record<number, string | 'loading' | null>>({});

  const fetchOrderDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError("Không thể tải chi tiết đơn hàng.");
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleRevealData = async (itemId: number) => {
    setRevealedData(prev => ({ ...prev, [itemId]: 'loading' }));
    try {
      const data = await getOrderItemProductData(itemId);
      setRevealedData(prev => ({ ...prev, [itemId]: data.product_data }));
    } catch (err) {
      alert("Không thể lấy dữ liệu sản phẩm. Vui lòng thử lại.");
      setRevealedData(prev => ({ ...prev, [itemId]: null }));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào clipboard!");
  };

  const handleReportError = async (itemId: number) => {
    const reason = prompt("Vui lòng nhập lý do báo lỗi cho sản phẩm này (ít nhất 10 ký tự):");
    if (!reason || reason.trim().length < 10) {
      alert("Lý do báo lỗi không hợp lệ.");
      return;
    }

    try {
      await api.post(`/errors/report/order-item/${itemId}`, { reason });
      alert('Báo lỗi của bạn đã được gửi thành công! Quản trị viên sẽ xem xét.');
      // Tải lại chi tiết đơn hàng để cập nhật trạng thái
      fetchOrderDetails();
    } catch (err: any) {
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể gửi báo lỗi.'}`);
    }
  };

  const isWithinReportDeadline = (orderDate: string) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    // updatedAt sẽ phản ánh thời điểm đơn hàng chuyển sang 'completed'
    return new Date(orderDate) > threeDaysAgo;
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = { 
        pending: 'Chờ thanh toán', 
        completed: 'Hoàn thành', 
        cancelled: 'Đã hủy', 
        disputed: 'Đang khiếu nại',
        archived: 'Đã thanh toán cho người bán'
    };
    // @ts-ignore
    return statusMap[status] || 'Không xác định';
  };
  
  const getStatusColor = (status: Order['status']) => {
    const statusMap = { 
        completed: 'bg-success-50 text-success-700', 
        pending: 'bg-warning-50 text-warning-700' , 
        disputed: 'bg-error-50 text-error-700',
        archived: 'bg-blue-50 text-blue-700',
        cancelled: 'bg-gray-100 text-gray-600'
    };
    // @ts-ignore
    return statusMap[status] || 'bg-gray-50 text-gray-700';
  };

  const getStatusIcon = (status: Order['status']) => {
    switch(status) {
      case 'completed': case 'archived': return <CheckCircle size={20} />;
      case 'pending': return <Clock size={20} />;
      case 'disputed': return <AlertTriangle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertTriangle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{error}</p></div>;
  if (!order) return <div className="text-center py-16 bg-white rounded-lg"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3><p className="mt-1 text-sm text-gray-500">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p></div>;

  return (
    <div>
      <div className="mb-6">
          <Link to="/don-hang" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
              <ChevronLeft size={16} className="mr-1" />
              Quay lại lịch sử đơn hàng
          </Link>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b">
              <div>
                  <h1 className="text-2xl font-bold mb-2">Đơn hàng #{order.id}</h1>
                  <p className="text-gray-600">Đặt ngày {formatDateTime(order.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{getStatusText(order.status)}</span>
                  </span>
              </div>
          </div>
          
          <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm đã mua</h2>
              <div className="overflow-x-auto">
                  <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                          {order.items.map((item) => (
                              <tr key={item.id}>
                                  <td className="px-2 md:px-6 py-4 w-full flex flex-col md:flex-row items-start md:items-center">
                                      <div className="flex items-start flex-grow">
                                          <img src={`${API_URL}${item.product.thumbnail_url}`} alt={item.product.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                          <div className="flex-grow">
                                              <p className="font-semibold text-gray-900">{item.product.name}</p>
                                              <p className="text-sm text-gray-500">Người bán: {item.seller?.username}</p>
                                              <p className="text-sm text-gray-700 font-medium mt-1">{formatCurrency(parseFloat(item.price))}</p>
                                          </div>
                                      </div>
                                      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 flex flex-col md:items-end space-y-2">
                                          {order.status === 'completed' || order.status === 'disputed' || order.status === 'archived' ? (
                                              revealedData[item.id] === 'loading' ? (
                                                  <div className="btn btn-sm btn-outline w-36 flex justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div></div>
                                              ) : revealedData[item.id] ? (
                                                  <div className="bg-gray-100 p-2 rounded-md text-sm w-full md:w-auto">
                                                      <pre className="font-mono text-gray-700 whitespace-pre-wrap break-all">{revealedData[item.id]}</pre>
                                                      <button onClick={() => handleCopy(revealedData[item.id] as string)} className="btn btn-xs btn-ghost mt-2 flex items-center"><Copy size={12} className="mr-1"/> Sao chép</button>
                                                  </div>
                                              ) : (
                                                  <button onClick={() => handleRevealData(item.id)} className="btn btn-sm btn-outline w-36 flex items-center justify-center"><Eye size={16} className="mr-2"/> Xem dữ liệu</button>
                                              )
                                          ) : null}
                                          
                                          {order.status === 'completed' && isWithinReportDeadline(order.updatedAt) && (
                                              <button onClick={() => handleReportError(item.id)} className="btn btn-xs bg-error-100 text-error-700 hover:bg-error-200 w-36 flex items-center justify-center">
                                                  <AlertTriangle size={14} className="mr-1.5" /> Báo lỗi
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
              <div className="w-full max-w-sm">
                  <div className="flex justify-between font-bold text-xl">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(parseFloat(order.total_amount))}</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default OrderDetail;
