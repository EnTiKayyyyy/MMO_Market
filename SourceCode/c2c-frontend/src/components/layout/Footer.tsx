import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-200 pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MMO_Market</h3>
            <p className="text-gray-400 mb-4">
              Chợ sản phẩm kỹ thuật số an toàn và uy tín. Kết nối người mua và người bán trên toàn Việt Nam.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link to="/san-pham" className="text-gray-400 hover:text-white transition-colors">Sản phẩm</Link>
              </li>
              <li>
                <Link to="/dich-vu" className="text-gray-400 hover:text-white transition-colors">Dịch vụ</Link>
              </li>
              <li>
                <Link to="/ho-tro" className="text-gray-400 hover:text-white transition-colors">Hỗ trợ</Link>
              </li>
              <li>
                <Link to="/gioi-thieu" className="text-gray-400 hover:text-white transition-colors">Giới thiệu</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/dieu-khoan" className="text-gray-400 hover:text-white transition-colors">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/chinh-sach" className="text-gray-400 hover:text-white transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/huong-dan" className="text-gray-400 hover:text-white transition-colors">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link to="/khieu-nai" className="text-gray-400 hover:text-white transition-colors">Khiếu nại & Hoàn tiền</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-gray-400 flex-shrink-0 mt-1" />
                <span className="text-gray-400">Tầng 5, Tòa nhà A1, Đường Phạm Hùng, Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-400">1900 1234 56</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-400">hotro@mmo-market.vn</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} MMO_Market - Chợ sản phẩm kỹ thuật số. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;