import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search, Home, ShoppingBag, MessageSquare, UserCircle, LogIn, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                    <div className="px-6 pt-6 pb-4">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-medium">Menu</Dialog.Title>
                        <button
                          type="button"
                          className="rounded-md p-1 text-gray-500 hover:text-gray-700"
                          onClick={onClose}
                        >
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="input"
                          />
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                            <Search size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 px-6 py-4">
                      <Link 
                        to="/"
                        className="flex items-center p-2 rounded hover:bg-gray-100"
                        onClick={onClose}
                      >
                        <Home size={20} className="mr-3 text-gray-500" />
                        <span className="font-medium">Trang chủ</span>
                      </Link>
                      
                      <Link 
                        to="/san-pham"
                        className="flex items-center p-2 rounded hover:bg-gray-100"
                        onClick={onClose}
                      >
                        <ShoppingBag size={20} className="mr-3 text-gray-500" />
                        <span className="font-medium">Sản phẩm</span>
                      </Link>
                      
                      {isAuthenticated ? (
                        <>
                          <Link 
                            to="/tin-nhan"
                            className="flex items-center p-2 rounded hover:bg-gray-100"
                            onClick={onClose}
                          >
                            <MessageSquare size={20} className="mr-3 text-gray-500" />
                            <span className="font-medium">Tin nhắn</span>
                          </Link>
                          
                          <Link 
                            to="/tai-khoan"
                            className="flex items-center p-2 rounded hover:bg-gray-100"
                            onClick={onClose}
                          >
                            <UserCircle size={20} className="mr-3 text-gray-500" />
                            <span className="font-medium">Tài khoản</span>
                          </Link>
                          
                          {user?.role === 'seller' && (
                            <Link 
                              to="/nguoi-ban/tong-quan"
                              className="flex items-center p-2 rounded hover:bg-gray-100"
                              onClick={onClose}
                            >
                              <Settings size={20} className="mr-3 text-gray-500" />
                              <span className="font-medium">Quản lý bán hàng</span>
                            </Link>
                          )}
                          
                          {user?.role === 'admin' && (
                            <Link 
                              to="/quan-tri/tong-quan"
                              className="flex items-center p-2 rounded hover:bg-gray-100"
                              onClick={onClose}
                            >
                              <Settings size={20} className="mr-3 text-gray-500" />
                              <span className="font-medium">Quản trị viên</span>
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link 
                          to="/dang-nhap"
                          className="flex items-center p-2 rounded hover:bg-gray-100"
                          onClick={onClose}
                        >
                          <LogIn size={20} className="mr-3 text-gray-500" />
                          <span className="font-medium">Đăng nhập</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileNav;