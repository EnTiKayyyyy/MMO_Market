// src/pages/ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Hook lấy URL params
import { getProductByIdOrSlug } from '../api/productApi';
import { addItemToCart } from '../api/cartApi'; // Import hàm thêm vào giỏ hàng
import './ProductDetailPage.css'; // Tạo file CSS này

function ProductDetailPage() {
  const { id: productIdentifier } = useParams(); // Lấy ID hoặc slug từ URL params (ví dụ: /products/123 hoặc /products/tai-khoan-facebook)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // State cho số lượng muốn thêm vào giỏ
  const [addingToCart, setAddingToCart] = useState(false); // State cho trạng thái thêm vào giỏ
  const [addToCartSuccess, setAddToCartSuccess] = useState(false); // State thông báo thêm thành công


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setProduct(null); // Reset sản phẩm khi ID thay đổi

        // Gọi API lấy chi tiết sản phẩm
        const productData = await getProductByIdOrSlug(productIdentifier);
        setProduct(productData);

      } catch (err) {
        console.error(`Failed to fetch product ${productIdentifier}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productIdentifier]); // Dependency array: chạy lại khi productIdentifier thay đổi

  // Xử lý khi click nút "Thêm vào giỏ hàng"
  const handleAddToCart = async () => {
      if (!product) return; // Không làm gì nếu chưa load xong sản phẩm

      setAddingToCart(true);
      setAddToCartSuccess(false);
      setError(null); // Reset lỗi

      try {
          // Gọi API thêm sản phẩm vào giỏ hàng
          // Cần đảm bảo user đã đăng nhập. Backend API đã kiểm tra auth.
          // Frontend có thể thêm kiểm tra useAuth().isAuthenticated trước khi cho click
          const updatedCart = await addItemToCart(product.product_id, quantity);

          console.log('Added to cart:', updatedCart);
          setAddToCartSuccess(true);
          // TODO: Cập nhật state giỏ hàng global (ví dụ: trong CartContext)
          // Hoặc hiển thị thông báo thành công

          // Tùy chọn: Reset số lượng về 1 sau khi thêm thành công
          setQuantity(1);

      } catch (err) {
          console.error('Failed to add item to cart:', err);
           const errorMessage = err.response?.data?.message || err.message || 'Không thể thêm sản phẩm vào giỏ hàng.';
          setError(errorMessage);
      } finally {
          setAddingToCart(false);
           // Tự động ẩn thông báo thành công sau vài giây
           setTimeout(() => setAddToCartSuccess(false), 3000);
      }
  };


  // Hiển thị trạng thái tải, lỗi hoặc sản phẩm không tìm thấy
  if (loading) {
    return <div>Đang tải chi tiết sản phẩm...</div>;
  }

  if (error) {
     const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải sản phẩm.';
    return <div style={{ color: 'red' }}>{errorMessage}</div>;
  }

  if (!product) { // Nếu không loading, không lỗi nhưng không có product
      return <div>Sản phẩm không tìm thấy.</div>;
  }


  // Render chi tiết sản phẩm
  const imageUrl = product.image_url || '/placeholder-image.png'; // Ảnh mặc định nếu không có

  return (
    <div className="product-detail-page">
        <div className="product-info">
             <div className="product-image">
                <img src={imageUrl} alt={product.name} />
             </div>
             <div className="product-details">
                <h1>{product.name}</h1>
                <p className="product-price">${parseFloat(product.base_price).toFixed(2)}</p>
                <div className="product-description">
                     <h3>Mô tả:</h3>
                     <p>{product.description || 'Không có mô tả.'}</p>
                </div>

                {/* Thông tin người bán */}
                 {product.seller && (
                    <div className="seller-info">
                         <h3>Người bán:</h3>
                         <p>{product.seller.store_name}</p>
                         {/* Thêm link đến trang seller profile nếu có */}
                    </div>
                 )}

                {/* Thông tin danh mục */}
                 {product.category && (
                     <div className="category-info">
                        <h3>Danh mục:</h3>
                         <p>{product.category.name}</p>
                     </div>
                 )}


                {/* Thêm vào giỏ hàng controls */}
                 <div className="add-to-cart-controls">
                    {/* Với loại sản phẩm digital MMO, số lượng thường là 1.
                       Nếu có thể mua nhiều đơn vị cùng loại, cho phép chọn số lượng. */}
                    <div>
                        <label htmlFor="quantity">Số lượng:</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} // Đảm bảo số lượng >= 1
                            min="1"
                            step="1"
                            style={{ width: '60px', marginLeft: '5px' }}
                        />
                    </div>
                    <button onClick={handleAddToCart} disabled={addingToCart}>
                        {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </button>
                 </div>

                 {addToCartSuccess && (
                     <div style={{ color: 'green', marginTop: '10px' }}>
                         Sản phẩm đã được thêm vào giỏ hàng!
                     </div>
                 )}
                 {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}


             </div>
        </div>

      {/* Thêm các section khác như đánh giá sản phẩm (nếu có) */}
    </div>
  );
}

export default ProductDetailPage;