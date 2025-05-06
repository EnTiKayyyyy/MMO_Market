// src/components/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // Tạo file CSS này để định kiểu

function ProductCard({ product }) {
  // Đảm bảo product object có đủ thông tin cần hiển thị
  if (!product) return null;

  const imageUrl = product.image_url || '/placeholder-image.png'; // Ảnh mặc định nếu không có
  const productLink = `/products/${product.slug || product.product_id}`; // Dùng slug nếu có, không thì dùng ID

  return (
    <div className="product-card">
      <Link to={productLink}>
        <img src={imageUrl} alt={product.name} className="product-card-image" />
        <div className="product-card-info">
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-price">${parseFloat(product.base_price).toFixed(2)}</p> {/* Định dạng tiền tệ */}
          {/* Hiển thị tên seller nếu có */}
           {product.seller && (
               <p className="product-card-seller">Bởi: {product.seller.store_name}</p>
           )}
        </div>
      </Link>
      {/* Nút thêm vào giỏ hàng sẽ thêm ở trang chi tiết */}
    </div>
  );
}

export default ProductCard;