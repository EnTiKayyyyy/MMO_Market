import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';

const BuyerProfile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-custom overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Thông tin tài khoản</h1>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                  <Camera size={20} className="text-gray-600" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Cho phép *.jpeg, *.jpg, *.png<br />
                Kích thước tối đa 2MB
              </p>
            </div>

            {/* Profile Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="input pl-10"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        className="input pl-10"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                      >
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary flex items-center">
                        <Save size={18} className="mr-2" />
                        Lưu thay đổi
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Thống kê đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng đơn hàng</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đơn hàng thành công</span>
              <span className="font-semibold text-success-600">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đơn hàng đang xử lý</span>
              <span className="font-semibold text-warning-600">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đơn hàng đã hủy</span>
              <span className="font-semibold text-error-600">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-custom p-6">
          <h2 className="text-lg font-semibold mb-4">Bảo mật tài khoản</h2>
          <div className="space-y-4">
            <button className="btn btn-outline w-full justify-start">
              Đổi mật khẩu
            </button>
            <button className="btn btn-outline w-full justify-start">
              Xác thực hai yếu tố
            </button>
            <button className="btn btn-outline w-full justify-start">
              Lịch sử đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;