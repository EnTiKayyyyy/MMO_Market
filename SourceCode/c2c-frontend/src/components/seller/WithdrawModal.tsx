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

interface WithdrawFormData {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, currentBalance, onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<WithdrawFormData>();
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
      reset(); // Xóa form sau khi gửi thành công
      onSuccess(); // Gọi hàm callback để đóng modal và làm mới dữ liệu
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Không render gì cả nếu modal không mở
  if (!isOpen) return null;

  return (
    // Lớp nền mờ
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      {/* Nội dung modal */}
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
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
            <input type="text" id="bankName" className="input" placeholder="VD: Vietcombank" {...register('bankName', { required: 'Vui lòng nhập tên ngân hàng' })} />
            {errors.bankName && <p className="text-red-600 text-sm mt-1">{errors.bankName.message}</p>}
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
            <input type="text" id="accountNumber" className="input" placeholder="Nhập số tài khoản" {...register('accountNumber', { required: 'Vui lòng nhập số tài khoản' })} />
            {errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber.message}</p>}
          </div>
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
            <input type="text" id="accountName" className="input" placeholder="NGUYEN VAN A" {...register('accountName', { required: 'Vui lòng nhập tên chủ tài khoản' })} />
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
