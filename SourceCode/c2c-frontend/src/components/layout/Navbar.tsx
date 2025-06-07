import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Menu, User, Bell, LogIn, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import UserDropdown from './UserDropdown';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/san-pham?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container-custom py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <div className="flex items-center text-primary-600">
                <div className="p-1.5 bg-primary-600 text-white rounded">
                  <User size={20} />
                </div>
                <span className="ml-2 text-xl font-bold">MMO_Market</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/san-pham" className="text-gray-700 hover:text-primary-600 font-medium">Sản phẩm</Link>
              <Link to="/dich-vu" className="text-gray-700 hover:text-primary-600 font-medium">Dịch vụ</Link>
              <Link to="/ho-tro" className="text-gray-700 hover:text-primary-600 font-medium">Hỗ trợ</Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center gap-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-64"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-600">
                <Search size={20} />
              </button>
            </form>
            
            <Link to="/gio-hang" className="relative p-2 rounded-full hover:bg-gray-100">
              <ShoppingCart size={22} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/tin-nhan" className="relative p-2 rounded-full hover:bg-gray-100">
                  <MessageCircle size={22} />
                </Link>
                <UserDropdown />
              </>
            ) : (
              <Link to="/dang-nhap" className="btn btn-primary flex items-center">
                <LogIn size={18} className="mr-1" />
                Đăng nhập
              </Link>
            )}
          </div>
          
          <button onClick={onMenuClick} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;