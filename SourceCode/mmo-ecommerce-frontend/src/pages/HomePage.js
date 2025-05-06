// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productApi'; // Import hàm API
import ProductCard from '../components/ProductCard'; // Import ProductCard
import './HomePage.css'; // Tạo file CSS này

function HomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Gọi API để lấy sản phẩm mới nhất (ví dụ: 8 sản phẩm, sắp xếp theo ngày tạo giảm dần)
        const result = await getAllProducts({ sort: 'created_at,desc', limit: 8 });
        setNewProducts(result.products);
      } catch (err) {
        console.error('Failed to fetch new products:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []); // Dependency array rỗng: chỉ chạy 1 lần khi mount

  // Hiển thị trạng thái tải hoặc lỗi
  if (loading) {
    return <div>Đang tải sản phẩm mới nhất...</div>;
  }

  if (error) {
     const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải sản phẩm.';
    return <div style={{ color: 'red' }}>Lỗi: {errorMessage}</div>;
  }

  return (
    <div className="homepage">
      <h1>Chào mừng đến với MMO Ecommerce</h1>
      {/* Thêm banner hoặc giới thiệu ở đây */}

      <h2>Sản phẩm mới nhất</h2>
      {newProducts.length === 0 ? (
        <p>Không có sản phẩm nào mới.</p>
      ) : (
        <div className="product-list-grid"> {/* Grid layout cho danh sách sản phẩm */}
          {newProducts.map(product => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
      {/* Thêm các section khác (ví dụ: sản phẩm bán chạy, theo danh mục) */}
    </div>
  );
}

export default HomePage;