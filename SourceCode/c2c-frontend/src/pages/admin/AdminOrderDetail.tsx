import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Package, DollarSign, Edit, CheckCircle, Clock, RotateCcw } from 'lucide-react'; // Thêm icon
import { adminGetOrderById, adminUpdateOrderStatus, adminRefundOrderItem } from '../../services/adminService'; // Thêm service
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { Order } from '../../services/orderService';

const AdminOrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async () => {
        if (!orderId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminGetOrderById(orderId);
            setOrder(response.data);
        } catch (err) {
            setError("Không thể tải chi tiết đơn hàng.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!orderId || !window.confirm(`Bạn có chắc chắn muốn đổi trạng thái đơn hàng thành "${newStatus}"?`)) {
            return;
        }
        try {
            await adminUpdateOrderStatus(orderId, newStatus);
            alert("Cập nhật trạng thái thành công!");
            fetchOrder();
        } catch (err: any) {
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        }
    };

    // Hàm xử lý hoàn tiền
    const handleRefund = async (itemId: number) => {
        const notes = prompt("Vui lòng nhập lý do hoàn tiền cho mục này:");
        if (!notes || notes.trim() === '') {
            alert("Lý do hoàn tiền là bắt buộc.");
            return;
        }
        try {
            await adminRefundOrderItem(String(itemId), notes);
            alert("Hoàn tiền cho mục đơn hàng thành công!");
            fetchOrder(); // Tải lại dữ liệu mới nhất
        } catch (err: any) {
            alert(`Lỗi khi hoàn tiền: ${err.response?.data?.message || err.message}`);
        }
    };
    
    const getStatusText = (status: string) => ({ pending: 'Chờ xử lý', paid: 'Đã thanh toán', completed: 'Hoàn thành', cancelled: 'Đã hủy', disputed: 'Khiếu nại', processing: 'Đang xử lý', refunded: 'Đã hoàn tiền' }[status] || status);
    const getStatusColor = (status: string) => ({ paid: 'text-success-600 bg-success-50', completed: 'text-blue-600 bg-blue-50', cancelled: 'text-error-600 bg-error-50', pending: 'text-warning-600 bg-warning-50', processing: 'text-accent-600 bg-accent-50', refunded: 'bg-gray-100 text-gray-700'}[status] || 'text-gray-600 bg-gray-50');

    if (isLoading) return <div className="text-center py-20">Đang tải...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!order) return <div className="text-center py-20">Không tìm thấy đơn hàng.</div>;

    return (
        <div>
            <div className="mb-6">
                <Link to="/quan-tri/don-hang" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
                    <ArrowLeft size={16} className="mr-1" />
                    Quay lại danh sách đơn hàng
                </Link>
                <div className="flex justify-between items-center mt-2">
                    <h1 className="text-2xl font-bold">Chi tiết Đơn hàng #{order.id}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-3">Danh sách sản phẩm</h2>
                        <table className="min-w-full">
                            <tbody className="divide-y">
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-4">
                                            <p className="font-medium text-gray-900">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Người bán: {item.seller?.username || 'N/A'}</p>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {getStatusText(item.status)}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">{formatCurrency(parseFloat(item.price))}</td>
                                        <td className="py-4 text-right">
                                            {/* Thêm nút hoàn tiền */}
                                            {item.status !== 'refunded' && item.status !== 'cancelled' && (
                                                <button 
                                                    onClick={() => handleRefund(item.id)} 
                                                    className="p-1 text-blue-600 hover:text-blue-900" 
                                                    title="Hoàn tiền cho mục này"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h3 className="text-lg font-semibold mb-4">Thông tin người mua</h3>
                        <p className="flex items-center"><User size={14} className="mr-2 text-gray-500" />{order.buyer.full_name}</p>
                        <p className="text-sm text-gray-600">{order.buyer.email}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h3 className="text-lg font-semibold mb-4">Tổng kết</h3>
                        <div className="flex justify-between border-t pt-4 font-bold text-lg">
                            <span>Tổng tiền</span>
                            <span>{formatCurrency(parseFloat(order.total_amount))}</span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h3 className="text-lg font-semibold mb-4">Thao tác của Admin</h3>
                        <div className="space-y-2">
                            <button onClick={() => handleStatusChange('processing')} className="w-full btn btn-outline flex items-center justify-center"><Clock size={16} className="mr-2" />Chuyển sang "Đang xử lý"</button>
                            <button onClick={() => handleStatusChange('completed')} className="w-full btn btn-primary flex items-center justify-center"><CheckCircle size={16} className="mr-2" />Hoàn thành đơn hàng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;