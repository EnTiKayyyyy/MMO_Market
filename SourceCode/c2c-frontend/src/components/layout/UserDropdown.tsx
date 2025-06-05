import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { User, ShoppingBag, LogOut, Settings, MessageSquare, CreditCard, Wallet } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const UserDropdown = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center p-1 rounded-full hover:bg-gray-100">
        <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
          <User size={18} />
        </div>
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b">
            <p className="text-sm">Đã đăng nhập với</p>
            <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/tai-khoan"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700 flex items-center`}
              >
                <User size={18} className="mr-3 text-gray-500" />
                Thông tin tài khoản
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/vi"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700 flex items-center`}
              >
                <Wallet size={18} className="mr-3 text-gray-500" />
                Ví của tôi
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/don-hang"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700 flex items-center`}
              >
                <ShoppingBag size={18} className="mr-3 text-gray-500" />
                Đơn hàng của tôi
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/tin-nhan"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700 flex items-center`}
              >
                <MessageSquare size={18} className="mr-3 text-gray-500" />
                Tin nhắn
              </Link>
            )}
          </Menu.Item>
          
          {user?.role === 'seller' && (
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/nguoi-ban/tong-quan"
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700 flex items-center`}
                >
                  <CreditCard size={18} className="mr-3 text-gray-500" />
                  Quản lý bán hàng
                </Link>
              )}
            </Menu.Item>
          )}
          
          {user?.role === 'admin' && (
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/quan-tri/tong-quan"
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700 flex items-center`}
                >
                  <Settings size={18} className="mr-3 text-gray-500" />
                  Quản trị hệ thống
                </Link>
              )}
            </Menu.Item>
          )}
          
          <div className="border-t my-1"></div>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center`}
              >
                <LogOut size={18} className="mr-3 text-gray-500" />
                Đăng xuất
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserDropdown;