import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BuyerProfile from './pages/profile/BuyerProfile';
import BuyerWallet from './pages/profile/BuyerWallet';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerWallet from './pages/seller/SellerWallet';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminSettings from './pages/admin/AdminSettings';
import NotFound from './pages/NotFound';
import OrderHistory from './pages/orders/OrderHistory';
import OrderDetail from './pages/orders/OrderDetail';
import MessagesPage from './pages/messages/Messages'; // SỬA ĐỔI: Import trang tin nhắn mới
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddProduct from './pages/seller/AddProduct';
import EditProductAdmin from './pages/admin/EditProduct';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import PaymentStatus from './pages/checkout/PaymentStatus';
import EditProduct from './pages/seller/EditProduct';
// import PaymentQR from './pages/checkout/PaymentQR'; 

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="san-pham" element={<ProductList />} />
        <Route path="san-pham/:id" element={<ProductDetail />} />
        <Route path="gio-hang" element={<Cart />} />
        <Route path="dang-nhap" element={<Login />} />
        <Route path="dang-ky" element={<Register />} />
        <Route path="vi/payment-status" element={<PaymentStatus />} />
        <Route path="*" element={<NotFound />} />

        <Route element={<ProtectedRoute role="buyer" />}>
          <Route path="thanh-toan" element={<Checkout />} />
          <Route path="tai-khoan" element={<BuyerProfile />} />
          <Route path="vi" element={<BuyerWallet />} />
          <Route path="don-hang" element={<OrderHistory />} />
          <Route path="don-hang/:id" element={<OrderDetail />} />
          {/* SỬA ĐỔI: Bật route cho trang tin nhắn */}
          <Route path="tin-nhan" element={<MessagesPage />} /> 
        </Route>

        <Route element={<ProtectedRoute role="seller" />}>
          <Route path="nguoi-ban/tong-quan" element={<SellerDashboard />} />
          <Route path="nguoi-ban/san-pham" element={<SellerProducts />} />
          <Route path="nguoi-ban/san-pham/them-moi" element={<AddProduct />} />
          <Route path="nguoi-ban/don-hang" element={<SellerOrders />} />
          <Route path="nguoi-ban/vi" element={<SellerWallet />} />
          <Route path="nguoi-ban/san-pham/:id/chinh-sua" element={<EditProduct />} />
          <Route path="nguoi-ban/don-hang/:id" element={<SellerOrderDetail />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="quan-tri/tong-quan" element={<AdminDashboard />} />
          <Route path="quan-tri/san-pham" element={<AdminProducts />} />
          <Route path="quan-tri/don-hang" element={<AdminOrders />} />
          <Route path="quan-tri/khieu-nai" element={<AdminComplaints />} />
          <Route path="quan-tri/rut-tien" element={<AdminWithdrawals />} />
          <Route path="quan-tri/cai-dat" element={<AdminSettings />} />
          <Route path="quan-tri/san-pham/:productId/chinh-sua" element={<EditProductAdmin />} />
          <Route path="quan-tri/don-hang/:orderId" element={<AdminOrderDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
