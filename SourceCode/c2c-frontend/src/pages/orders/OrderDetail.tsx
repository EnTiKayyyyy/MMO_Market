import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, Key, Copy, User, AlertCircle, Eye } from 'lucide-react';

// Import các service và hàm tiện ích
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getOrderById, getOrderItemProductData } from '../../services/orderService';
import type { Order } from '../../services/orderService';

// URL của backend để ghép nối với đường dẫn ảnh (nếu có)
const API_URL = 'http://localhost:3000';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State để lưu trữ product_data đã xem, key là itemId
  // Giá trị có thể là string (dữ liệu), 'loading', hoặc null
  const [revealedData, setRevealedData] = useState<Record<number, string | 'loading' | null>>({});

  // useEffect để tải chi tiết đơn hàng khi component được mount hoặc ID thay đổi
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(`Lỗi khi tải chi tiết đơn hàng #${id}:`, err);
        setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  /**
   * Xử lý sự kiện khi người dùng nhấn nút "Xem thông tin"
   * @param itemId ID của mục sản phẩm trong đơn hàng (order_item.id)
   */
  const handleViewProductData = async (itemId: number) => {
    // Nếu đã có dữ liệu hoặc đang tải thì không gọi API nữa
    if (revealedData[itemId]) return;

    // Đánh dấu là đang tải cho mục này để hiển thị spinner
    setRevealedData(prev => ({ ...prev, [itemId]: 'loading' }));

    try {
        const response = await getOrderItemProductData(itemId);
        setRevealedData(prev => ({ ...prev, [itemId]: response.product_data }));
    } catch (error: any) {
        alert(`Lỗi: ${error.response?.data?.message || 'Không thể xem thông tin.'}`);
        // Xóa trạng thái loading nếu có lỗi để người dùng có thể thử lại
        setRevealedData(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
        });
    }
  };

  /**
   * Hàm để sao chép nội dung vào clipboard
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã sao chép nội dung sản phẩm!');
    }).catch(err => {
        console.error('Không thể sao chép:', err);
    });
  };

  /**
   * Các hàm helper để hiển thị trạng thái đơn hàng
   */
  const getStatusText = (status: Order['status']) => {
    const statusMap = { pending: 'Chờ xử lý', paid: 'Đã thanh toán', processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy', disputed: 'Đang khiếu nại' };
    // @ts-ignore
    return statusMap[status] || 'Không xác định';
  };
  
  const getStatusColor = (status: Order['status']) => {
    const statusMap = { completed: 'bg-success-50 text-success-700', processing: 'bg-accent-50 text-accent-700', paid: 'bg-blue-50 text-blue-700', pending: 'bg-warning-50 text-warning-700', cancelled: 'bg-error-50 text-error-700' };
    // @ts-ignore
    return statusMap[status] || 'bg-gray-50 text-gray-700';
  };

  const getStatusIcon = (status: Order['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle size={20} />;
      case 'processing': case 'pending': case 'paid': return <Clock size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };
  
  // Render các trạng thái khác nhau của trang
  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }
  if (error) {
    return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertCircle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{error}</p></div>;
  }
  if (!order) {
    return <div className="text-center py-16 bg-white rounded-lg"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3><p className="mt-1 text-sm text-gray-500">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/don-hang" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
          <ChevronLeft size={16} className="mr-1" />
          Quay lại lịch sử đơn hàng
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6 mb-6">
        {/* Header chi tiết đơn hàng */}
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

        {/* Bảng sản phẩm */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm đã mua</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 md:px-6 py-4 w-full">
                      <div className="flex items-start">
                        <img 
                            src={item.product.thumbnail_url ? `${API_URL}${item.product.thumbnail_url}` : 'https://via.placeholder.com/150?text=No+Image'}
                            alt={item.product.name}
                            className="w-20 h-20 rounded-lg object-cover mr-4 border hidden sm:block"
                        />
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(parseFloat(item.price))}</p>
                          
                          {/* Nút "Xem thông tin" chỉ hiển thị khi đơn hàng hoàn thành */}
                          {order.status === 'completed' && (
                            <div className="mt-3">
                              {revealedData[item.id] && revealedData[item.id] !== 'loading' ? (
                                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                  <h4 className="text-xs font-semibold text-primary-800 mb-2 flex items-center"><Key size={14} className="mr-1.5" />Nội dung sản phẩm</h4>
                                  <pre className="text-sm bg-white p-3 rounded whitespace-pre-wrap font-mono break-all">{revealedData[item.id]}</pre>
                                  <button onClick={() => handleCopy(revealedData[item.id]!)} className="mt-2 text-xs text-primary-600 hover:text-primary-800 flex items-center"><Copy size={12} className="mr-1" />Sao chép</button>
                                </div>
                              ) : (
                                <button onClick={() => handleViewProductData(item.id)} disabled={revealedData[item.id] === 'loading'} className="btn btn-xs btn-outline flex items-center disabled:opacity-50">
                                  {revealedData[item.id] === 'loading' ? 'Đang tải...' : <><Eye size={14} className="mr-1.5" /> Xem thông tin</>}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng kết đơn hàng */}
        <div className="flex justify-end pt-4 border-t">
          <div className="w-full max-w-sm">
            <div className="flex justify-between font-bold text-xl">
              <span>Tổng cộng</span>
              <span>{formatCurrency(parseFloat(order.total_amount))}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-custom p-6">
        <h2 className="text-lg font-semibold mb-4">Thao tác</h2>
        <div className="flex flex-wrap gap-4">
          {order.status !== 'completed' && (<button className="btn btn-outline">Khiếu nại</button>)}
          {order.status === 'completed' && (<button className="btn btn-primary">Đánh giá sản phẩm</button>)}
          <Link to="/ho-tro" className="btn btn-outline">Liên hệ hỗ trợ</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
