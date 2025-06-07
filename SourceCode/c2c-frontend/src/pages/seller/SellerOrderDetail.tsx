import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getOrderById } from '../../services/orderService'; // Sử dụng lại service đã có
import type { Order, OrderItem } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useAuthStore } from '../../stores/authStore';

const SellerOrderDetail = () => {
    // SỬA ĐỔI: Lấy đúng tham số "id" từ URL và đổi tên thành "orderId"
    const { id: orderId } = useParams<{ id: string }>();
    const { user } = useAuthStore(); // Lấy thông tin seller hiện tại

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State để lưu các sản phẩm chỉ của seller này trong đơn hàng
    const [sellerItems, setSellerItems] = useState<OrderItem[]>([]);
    const [sellerTotal, setSellerTotal] = useState(0);

    useEffect(() => {
        // Kiểm tra orderId sau khi đã lấy đúng từ URL
        if (!orderId) {
            setIsLoading(false);
            setError("Không tìm thấy mã đơn hàng.");
            return;
        }

        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                // Gọi API với orderId đã được lấy đúng
                const data = await getOrderById(orderId);
                setOrder(data);

                // Lọc ra các item chỉ thuộc về người bán đang xem
                // Dùng so sánh '==' để không bị ảnh hưởng bởi kiểu dữ liệu (string vs number)
                const itemsOfThisSeller = data.items.filter(item => item.seller?.id == user?.id);
                setSellerItems(itemsOfThisSeller);

                // Tính tổng số tiền seller kiếm được từ đơn hàng này
                const total = itemsOfThisSeller.reduce((sum, item) => sum + parseFloat(item.price), 0);
                setSellerTotal(total);

            } catch (err: any) {
                setError(err.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, user?.id]); // useEffect sẽ chạy lại khi orderId thay đổi

    const getStatusText = (status: string) => ({ pending: 'Chờ xử lý', paid: 'Đã thanh toán', completed: 'Hoàn thành', cancelled: 'Đã hủy', disputed: 'Khiếu nại', processing: 'Đang xử lý' }[status] || status);
    const getStatusColor = (status: string) => ({ paid: 'text-success-600 bg-success-50', completed: 'text-blue-600 bg-blue-50', cancelled: 'text-error-600 bg-error-50', pending: 'text-warning-600 bg-warning-50', processing: 'text-accent-600 bg-accent-50'}[status] || 'text-gray-600 bg-gray-50');

    if (isLoading) {
        return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>;
    }

    if (error) {
        return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertTriangle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{error}</p></div>;
    }
    
    if (!order || sellerItems.length === 0) {
        return <div className="text-center py-16 bg-white rounded-lg"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3><p className="mt-1 text-sm text-gray-500">Đơn hàng không tồn tại hoặc không chứa sản phẩm của bạn.</p></div>
    }

    return (
        <div>
            <div className="mb-6">
                <Link to="/nguoi-ban/don-hang" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
                    <ChevronLeft size={16} className="mr-1" />
                    Quay lại danh sách đơn hàng
                </Link>
                <div className="flex justify-between items-center mt-2">
                    <h1 className="text-2xl font-bold">Chi tiết Đơn hàng #{order.id}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Danh sách các sản phẩm của bạn trong đơn hàng này */}
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-3">Các sản phẩm của bạn trong đơn hàng</h2>
                        <div className="space-y-4">
                            {sellerItems.map(item => (
                                <div key={item.id} className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Mã sản phẩm: {item.product.id}</p>
                                        <p className="text-sm text-gray-500">Trạng thái: <span className="font-semibold">{getStatusText(item.status)}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">{formatCurrency(parseFloat(item.price))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Thông tin người mua */}
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h3 className="text-lg font-semibold mb-4">Thông tin người mua</h3>
                        <p className="flex items-center"><User size={14} className="mr-2 text-gray-500" />{order.buyer.full_name}</p>
                        <p className="text-sm text-gray-600 ml-6">@{order.buyer.username}</p>
                    </div>

                    {/* Tổng kết doanh thu của bạn từ đơn hàng này */}
                    <div className="bg-white p-6 rounded-lg shadow-custom">
                        <h3 className="text-lg font-semibold mb-4">Tổng kết</h3>
                        <div className="flex justify-between border-t pt-4 font-bold text-lg">
                            <span>Doanh thu của bạn</span>
                            <span>{formatCurrency(sellerTotal)}</span>
                        </div>
                         <p className="text-xs text-gray-500 mt-2">Doanh thu này chưa trừ phí giao dịch của sàn.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerOrderDetail;
