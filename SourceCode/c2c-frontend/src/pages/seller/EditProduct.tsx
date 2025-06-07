import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getProductById } from '../../services/productService'; // Dùng lại service có sẵn
import { updateProduct } from '../../services/sellerService'; // Hàm này cần được tạo
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../services/categoryService';
import type { Product } from '../../types/product';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  product_data: string;
  productImage?: FileList;
}

const EditProduct = () => {
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) {
            navigate('/nguoi-ban/san-pham');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Lấy song song dữ liệu sản phẩm và danh mục
                const [productData, categoryData] = await Promise.all([
                    getProductById(productId),
                    getAllCategories()
                ]);

                if (!productData) {
                    setServerError("Không tìm thấy sản phẩm.");
                    return;
                }

                setCategories(categoryData);
                
                // Điền dữ liệu sản phẩm vào form
                reset({
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    category_id: productData.category.id,
                    product_data: '', // Không hiển thị product_data cũ vì lý do bảo mật
                });

            } catch (err) {
                console.error("Lỗi tải dữ liệu sản phẩm:", err);
                setServerError("Không thể tải dữ liệu sản phẩm.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId, reset, navigate]);

    const onSubmit = async (data: ProductFormData) => {
        if (!productId) return;
        setIsSaving(true);
        setServerError(null);
        
        const formData = new FormData();
        // Chỉ thêm các trường có giá trị vào formData để tránh ghi đè trống
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('category_id', data.category_id.toString());
        // Chỉ gửi product_data nếu người dùng nhập mới
        if (data.product_data) {
            formData.append('product_data', data.product_data);
        }
        if (data.productImage && data.productImage.length > 0) {
            formData.append('productImage', data.productImage[0]);
        }

        try {
            await updateProduct(productId, formData);
            alert("Cập nhật sản phẩm thành công!");
            navigate('/nguoi-ban/san-pham');
        } catch (err: any) {
            setServerError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary-600"/></div>;
    }

    if (serverError) {
        return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertCircle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{serverError}</p></div>;
    }
    
    return (
        <div>
            <div className="mb-6">
                <Link to="/nguoi-ban/san-pham" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
                    <ArrowLeft size={16} className="mr-1" />
                    Quay lại danh sách sản phẩm
                </Link>
                <h1 className="text-2xl font-bold mt-2">Chỉnh sửa sản phẩm</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-custom space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                            <input id="name" type="text" className="input" {...register('name', { required: "Tên sản phẩm là bắt buộc" })} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                            <textarea id="description" rows={5} className="input" {...register('description', { required: "Mô tả là bắt buộc" })}></textarea>
                        </div>
                        <div>
                            <label htmlFor="product_data" className="block text-sm font-medium text-gray-700 mb-1">Nội dung sản phẩm mới (tùy chọn)</label>
                            <textarea id="product_data" rows={7} className="input font-mono" placeholder="Bỏ trống nếu không muốn thay đổi nội dung" {...register('product_data')}></textarea>
                             <p className="text-xs text-gray-500 mt-1">Nếu bạn điền vào đây, nội dung sản phẩm sẽ được cập nhật. Nếu để trống, nội dung cũ sẽ được giữ lại.</p>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                            <input id="price" type="number" className="input" {...register('price', { required: "Giá bán là bắt buộc", valueAsNumber: true, min: 1000 })} />
                        </div>
                         <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select id="category_id" className="input" {...register('category_id', { required: "Vui lòng chọn danh mục", valueAsNumber: true })}>
                                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm mới (tùy chọn)</label>
                            <input id="productImage" type="file" className="input" {...register('productImage')} accept="image/*"/>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t"><div className="flex justify-end">
                    <Link to="/nguoi-ban/san-pham" className="btn btn-outline mr-3">Hủy</Link>
                    <button type="submit" className="btn btn-primary flex items-center" disabled={isSaving}>
                        {isSaving ? (<><Loader2 className="animate-spin h-4 w-4 mr-2"/> Đang lưu...</>) : (<><Save size={18} className="mr-2"/>Lưu thay đổi</>)}
                    </button>
                </div></div>
            </form>
        </div>
    );
};

export default EditProduct;