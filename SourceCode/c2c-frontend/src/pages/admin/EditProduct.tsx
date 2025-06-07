import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminGetProductById, adminUpdateProduct, adminDeleteProduct } from '../../services/adminService';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../services/categoryService';
import type { AdminProduct } from '../../services/adminService';

type ProductEditFormData = Omit<AdminProduct, 'id' | 'createdAt' | 'seller'> & {
    productImage?: FileList;
};

const EditProductAdmin = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductEditFormData>();
    
    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) {
            navigate('/quan-tri/san-pham');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productResponse, categoriesResponse] = await Promise.all([
                    adminGetProductById(productId),
                    getAllCategories()
                ]);
                
                const productData = productResponse.data;
                setProduct(productData);
                setCategories(categoriesResponse);
                
                // Điền dữ liệu vào form
                reset({
                    name: productData.name,
                    description: productData.description,
                    price: parseFloat(productData.price),
                    category_id: productData.category.id,
                    status: productData.status,
                    product_data: productData.product_data,
                });

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
                setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId, reset, navigate]);

    const onSubmit = async (data: ProductEditFormData) => {
        if (!productId) return;
        setIsSaving(true);
        setError(null);
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'productImage' && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (data.productImage && data.productImage.length > 0) {
            formData.append('productImage', data.productImage[0]);
        }

        try {
            await adminUpdateProduct(productId, formData);
            alert("Cập nhật sản phẩm thành công!");
            navigate('/quan-tri/san-pham');
        } catch (err: any) {
            setError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!productId) return;
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${product?.name}"?`)) {
            try {
                await adminDeleteProduct(productId);
                alert("Đã xóa sản phẩm thành công.");
                navigate('/quan-tri/san-pham');
            } catch (err: any) {
                alert(`Lỗi khi xóa sản phẩm: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    if (error) {
        return <div className="text-center py-16 bg-red-50 rounded-lg"><AlertCircle className="mx-auto h-12 w-12 text-error-500" /><h3 className="mt-2 text-lg font-medium text-error-800">Đã xảy ra lỗi</h3><p className="mt-1 text-sm text-error-700">{error}</p></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <Link to="/quan-tri/san-pham" className="flex items-center text-sm text-gray-600 hover:text-primary-600">
                    <ArrowLeft size={16} className="mr-1" />
                    Quay lại danh sách
                </Link>
                <h1 className="text-2xl font-bold mt-2">Chỉnh sửa Sản phẩm #{productId}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-custom space-y-6">
                {/* Các trường input tương tự trang AddProduct nhưng có giá trị mặc định */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                            <input id="name" type="text" className="input" {...register('name', { required: "Tên sản phẩm là bắt buộc" })} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                            <textarea id="description" rows={5} className="input" {...register('description')}></textarea>
                        </div>
                         <div>
                            <label htmlFor="product_data" className="block text-sm font-medium text-gray-700 mb-1">Nội dung sản phẩm</label>
                            <textarea id="product_data" rows={7} className="input font-mono" {...register('product_data', { required: "Nội dung sản phẩm là bắt buộc" })}></textarea>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                            <input id="price" type="number" className="input" {...register('price', { required: "Giá bán là bắt buộc", valueAsNumber: true })} />
                        </div>
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select id="category_id" className="input" {...register('category_id', { required: "Vui lòng chọn danh mục", valueAsNumber: true })}>
                                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select id="status" className="input" {...register('status')}>
                                <option value="pending_approval">Chờ duyệt</option>
                                <option value="available">Đang bán</option>
                                <option value="sold">Đã bán</option>
                                <option value="delisted">Đã gỡ bán</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t flex justify-between items-center">
                    <button type="button" onClick={handleDelete} className="btn bg-error-600 hover:bg-error-700 text-white flex items-center">
                        <Trash2 size={18} className="mr-2"/> Xóa sản phẩm
                    </button>
                    <div className="flex justify-end">
                        <Link to="/quan-tri/san-pham" className="btn btn-outline mr-3">Hủy</Link>
                        <button type="submit" className="btn btn-primary flex items-center" disabled={isSaving}>
                            {isSaving ? "Đang lưu..." : <><Save size={18} className="mr-2"/>Lưu thay đổi</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProductAdmin;
