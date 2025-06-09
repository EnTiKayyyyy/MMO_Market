import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Send } from 'lucide-react';
import { createPayoutRequest } from '../../services/sellerService';
import { formatCurrency } from '../../utils/format';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: () => void;
}

// Danh sách các ngân hàng được hỗ trợ
const supportedBanks = [
    { name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank' },
    { name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank' },
    { name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB' },
    { name: 'Ngân hàng TMCP Quân đội', shortName: 'MB Bank' },
    { name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV' },
    { name: 'Ngân hàng TMCP Công Thương Việt Nam', shortName: 'Vietinbank' },
    { name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', shortName: 'Agribank' },
    { name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank' },
    { name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank' },
    { name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank' },
    { name: 'Ngân hàng TMCP Quốc tế Việt Nam', shortName: 'VIB' },
];

interface WithdrawFormData {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, currentBalance, onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<WithdrawFormData>({
    defaultValues: {
      bankName: supportedBanks[0].shortName // Đặt giá trị mặc định cho select
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: WithdrawFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await createPayoutRequest(data.amount, {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });
      alert("Yêu cầu rút tiền của bạn đã được gửi thành công!");
      reset(); 
      onSuccess();
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tạo yêu cầu rút tiền</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Số dư khả dụng: <span className="font-bold text-primary-600">{formatCurrency(currentBalance)}</span></p>
        
        {serverError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn rút</label>
            <input 
              type="number" 
              id="amount" 
              className="input" 
              placeholder="Tối thiểu 50,000đ" 
              {...register('amount', { 
                required: 'Vui lòng nhập số tiền', 
                valueAsNumber: true,
                min: { value: 50000, message: 'Số tiền rút tối thiểu là 50,000đ' },
                max: { value: currentBalance, message: 'Số tiền rút không được lớn hơn số dư' }
              })} 
            />
             {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          
          {/* ĐÃ THAY ĐỔI: Sử dụng select cho ngân hàng */}
          <div>
            <label htmlFor="bankNameModal" className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
            <select
              id="bankNameModal"
              className="input"
              {...register('bankName', { required: 'Vui lòng chọn ngân hàng' })}
            >
              {supportedBanks.map((bank) => (
                <option key={bank.shortName} value={bank.shortName}>
                  {bank.name} ({bank.shortName})
                </option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-600 text-sm mt-1">{errors.bankName.message}</p>}
          </div>

          <div>
            <label htmlFor="accountNumberModal" className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
            <input type="text" id="accountNumberModal" className="input" placeholder="Nhập số tài khoản" {...register('accountNumber', { required: 'Vui lòng nhập số tài khoản' })} />
            {errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber.message}</p>}
          </div>
          <div>
            <label htmlFor="accountNameModal" className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
            <input type="text" id="accountNameModal" className="input" placeholder="NGUYEN VAN A" {...register('accountName', { required: 'Vui lòng nhập tên chủ tài khoản' })} />
            {errors.accountName && <p className="text-red-600 text-sm mt-1">{errors.accountName.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn btn-outline">Hủy</button>
              <button type="submit" className="btn btn-primary flex items-center justify-center" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : <><Send size={18} className="mr-2"/>Gửi yêu cầu</>}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
