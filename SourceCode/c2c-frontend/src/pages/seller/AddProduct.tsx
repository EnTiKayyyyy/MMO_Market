import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Package, UploadCloud, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { createProduct } from '../../services/sellerService';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../services/categoryService';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  product_data: string;
  productImage: FileList;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductFormData>();
  const productImage = watch("productImage");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (productImage && productImage.length > 0) {
      const file = productImage[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      return () => URL.revokeObjectURL(previewUrl);
    } else {
        setImagePreview(null);
    }
  }, [productImage]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category_id', data.category_id.toString());
    formData.append('product_data', data.product_data);
    
    if (data.productImage && data.productImage.length > 0) {
      formData.append('productImage', data.productImage[0]);
    }

    try {
      await createProduct(formData);
      alert('Sản phẩm của bạn đã được gửi đi để chờ duyệt!');
      navigate('/nguoi-ban/san-pham');
    } catch (err: any) {
      console.error("Lỗi khi tạo sản phẩm:", err);
      setServerError(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div className="mb-6">
            <Link to="/nguoi-ban/san-pham" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
                <ArrowLeft size={16} className="mr-1" />
                Quay lại danh sách sản phẩm
            </Link>
            <h1 className="text-2xl font-bold mt-2">Thêm sản phẩm mới</h1>
            <p className="text-gray-500">Điền thông tin chi tiết về sản phẩm bạn muốn bán.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-custom space-y-6">
            {serverError && (
                <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-center">
                    <AlertCircle size={20} className="mr-3"/>
                    <span>{serverError}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input id="name" type="text" className="input" {...register('name', { required: "Tên sản phẩm là bắt buộc" })} />
                        {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                        <textarea id="description" rows={5} className="input" {...register('description', { required: "Mô tả là bắt buộc" })}></textarea>
                        {errors.description && <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="product_data" className="block text-sm font-medium text-gray-700 mb-1">Nội dung sản phẩm</label>
                        <textarea id="product_data" rows={7} className="input font-mono" placeholder="Ví dụ: key, tài khoản, mật khẩu, link tải..." {...register('product_data', { required: "Nội dung sản phẩm là bắt buộc" })}></textarea>
                        <p className="text-xs text-gray-500 mt-1">Đây là nội dung sẽ được tự động gửi cho người mua sau khi họ thanh toán thành công.</p>
                        {errors.product_data && <p className="mt-1 text-sm text-error-600">{errors.product_data.message}</p>}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                        <input id="price" type="number" className="input" {...register('price', { required: "Giá bán là bắt buộc", valueAsNumber: true, min: { value: 1000, message: "Giá bán phải ít nhất là 1,000đ" } })} />
                        {errors.price && <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select id="category_id" className="input" {...register('category_id', { required: "Vui lòng chọn danh mục", valueAsNumber: true })}>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                        {errors.category_id && <p className="mt-1 text-sm text-error-600">{errors.category_id.message}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div className="relative group">
                                        <img src={imagePreview} alt="Xem trước" className="mx-auto h-32 w-auto rounded-md object-contain"/>
                                        <div onClick={() => {setImagePreview(null); /* Cần reset cả input */}} className="absolute top-0 right-0 -mt-2 -mr-2 cursor-pointer bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></div>
                                    </div>
                                ) : (
                                    <><UploadCloud className="mx-auto h-12 w-12 text-gray-400"/><div className="flex text-sm text-gray-600"><label htmlFor="productImage" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"><span>Tải lên một file</span><input id="productImage" type="file" className="sr-only" {...register('productImage', { required: "Ảnh sản phẩm là bắt buộc"})} accept="image/*"/></label><p className="pl-1">hoặc kéo và thả</p></div><p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p></>
                                )}
                            </div>
                        </div>
                         {errors.productImage && <p className="mt-1 text-sm text-error-600">{errors.productImage.message}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-5 border-t"><div className="flex justify-end">
                <Link to="/nguoi-ban/san-pham" className="btn btn-outline mr-3">Hủy</Link>
                <button type="submit" className="btn btn-primary flex items-center" disabled={isLoading}>{isLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Đang gửi...</>) : (<><Package size={18} className="mr-2"/>Gửi duyệt sản phẩm</>)}</button>
            </div></div>
        </form>
    </div>
  );
};

export default AddProduct;
