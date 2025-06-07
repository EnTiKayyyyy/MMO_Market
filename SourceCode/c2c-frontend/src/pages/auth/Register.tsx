import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

// Thêm 'role' vào interface của form
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  role: 'buyer' | 'seller';
}

const Register = () => {
  const { register: registerUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
      // Đặt giá trị mặc định cho vai trò là 'buyer'
      defaultValues: {
          role: 'buyer'
      }
  });
  const password = watch('password', '');
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Truyền vai trò đã chọn vào hàm đăng ký
      await registerUser(data.name, data.email, data.password, data.role);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-custom p-8 mt-6 mb-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
        <p className="text-gray-600 mt-2">Tạo tài khoản để mua sắm dễ dàng hơn</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Các trường input khác giữ nguyên */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
          <input id="name" type="text" className={`input ${errors.name ? 'border-error-500' : ''}`} placeholder="Nguyễn Văn A"
            {...register('name', { required: 'Họ tên là bắt buộc' })}
          />
          {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="email" type="email" className={`input ${errors.email ? 'border-error-500' : ''}`} placeholder="your-email@example.com"
            {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' }})}
          />
          {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
           <div className="relative">
             <input id="password" type={showPassword ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'border-error-500' : ''}`} placeholder="••••••••"
                {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }})}
             />
             <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
           </div>
          {errors.password && <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>}
        </div>

        <div>
           <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
           <input id="confirmPassword" type={showPassword ? 'text' : 'password'} className={`input ${errors.confirmPassword ? 'border-error-500' : ''}`} placeholder="••••••••"
            {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu', validate: value => value === password || 'Mật khẩu không khớp' })}
           />
           {errors.confirmPassword && <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* THÊM MỚI: Lựa chọn vai trò */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bạn muốn đăng ký với vai trò?</label>
          <div className="flex gap-x-6">
            <div className="flex items-center">
              <input id="role-buyer" type="radio" value="buyer"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                {...register('role', { required: 'Vui lòng chọn vai trò của bạn' })}
              />
              <label htmlFor="role-buyer" className="ml-2 block text-sm text-gray-900">Người mua</label>
            </div>
            <div className="flex items-center">
              <input id="role-seller" type="radio" value="seller"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                {...register('role', { required: 'Vui lòng chọn vai trò của bạn' })}
              />
              <label htmlFor="role-seller" className="ml-2 block text-sm text-gray-900">Người bán</label>
            </div>
          </div>
          {errors.role && <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>}
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input id="agreeTerms" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register('agreeTerms', { required: 'Bạn phải đồng ý với điều khoản sử dụng' })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className={`font-medium ${errors.agreeTerms ? 'text-error-600' : 'text-gray-700'}`}>
              Tôi đồng ý với <Link to="/dieu-khoan" className="text-primary-600 hover:text-primary-500">Điều khoản sử dụng</Link>
            </label>
          </div>
        </div>
        
        <div><button type="submit" disabled={isLoading} className="w-full btn btn-primary py-2.5 flex items-center justify-center">{isLoading ? 'Đang xử lý...' : <><UserPlus size={20} className="mr-2" />Đăng ký</>}</button></div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">Đã có tài khoản?{' '}<Link to="/dang-nhap" className="text-primary-600 hover:text-primary-500 font-medium">Đăng nhập</Link></p>
      </div>
    </div>
  );
};

export default Register;
