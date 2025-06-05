import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'MMO_Market',
    siteDescription: 'Chợ sản phẩm kỹ thuật số',
    contactEmail: 'hotro@mmo-market.vn',
    contactPhone: '1900 1234 56',
    minWithdrawal: 500000,
    commissionRate: 5,
    maintenanceMode: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement settings update logic here
    alert('Cài đặt đã được lưu');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-1">Quản lý các cài đặt chung của hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-custom p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Tên trang web
              </label>
              <input
                type="text"
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả trang web
              </label>
              <input
                type="text"
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                id="contactEmail"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền rút tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                id="minWithdrawal"
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ hoa hồng (%)
              </label>
              <input
                type="number"
                id="commissionRate"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Bật chế độ bảo trì</span>
            </label>
          </div>

          {settings.maintenanceMode && (
            <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-md flex items-start">
              <AlertCircle size={20} className="text-warning-600 mr-3 mt-0.5" />
              <p className="text-sm text-warning-700">
                Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập vào hệ thống. Chỉ quản trị viên mới có thể đăng nhập.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn btn-primary flex items-center">
              <Save size={18} className="mr-2" />
              Lưu cài đặt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;