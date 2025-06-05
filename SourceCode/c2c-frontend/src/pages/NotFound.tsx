import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-9xl font-extrabold text-gray-900">404</h2>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Không tìm thấy trang</h1>
          <p className="mt-2 text-sm text-gray-600">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center mt-10">
          <Link to="/" className="btn btn-primary flex justify-center items-center">
            <Home size={18} className="mr-2" />
            Về trang chủ
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-outline flex justify-center items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;