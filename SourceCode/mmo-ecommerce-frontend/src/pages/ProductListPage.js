// src/pages/ProductListPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook lấy và thay đổi query params
import { getAllProducts } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi'; // Import API Categories
import ProductCard from '../components/ProductCard';
import './ProductListPage.css'; // Tạo file CSS này

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State cho danh mục
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Lấy và quản lý query params trên URL (ví dụ: /products?category=1&sort=price,asc&page=2)
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy các giá trị từ URL params
  const categoryId = searchParams.get('category');
  const searchTerm = searchParams.get('search') || ''; // Tìm kiếm
  const sortTerm = searchParams.get('sort') || 'created_at,desc'; // Mặc định sắp xếp mới nhất
  const currentPage = parseInt(searchParams.get('page'), 10) || 1; // Trang hiện tại
  const limit = 10; // Số sản phẩm trên mỗi trang (cố định hoặc từ setting)


  // Effect để lấy danh sách sản phẩm khi các params thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Chuẩn bị params gửi lên API
        const params = {
          page: currentPage,
          limit: limit,
          sort: sortTerm,
          search: searchTerm,
          category_id: categoryId, // Truyền category_id nếu có
        };

        // Gọi API lấy sản phẩm
        const result = await getAllProducts(params);

        setProducts(result.products);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });

      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err);
        setProducts([]); // Xóa sản phẩm nếu lỗi
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 }); // Reset phân trang
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchTerm, sortTerm, currentPage, limit, searchParams]); // Dependency array: chạy lại khi các giá trị này thay đổi

  // Effect để lấy danh sách danh mục (chỉ chạy 1 lần khi mount)
  useEffect(() => {
      const fetchCategories = async () => {
          try {
              const cats = await getAllCategories();
              setCategories(cats);
          } catch (err) {
              console.error('Failed to fetch categories:', err);
              // Xử lý lỗi lấy danh mục
          }
      };
      fetchCategories();
  }, []);


  // --- Hàm xử lý thay đổi bộ lọc, sắp xếp, phân trang ---

  const handleCategoryChange = (newCategoryId) => {
      // Cập nhật query params trên URL
      setSearchParams(params => {
          if (newCategoryId) {
              params.set('category', newCategoryId);
          } else {
              params.delete('category'); // Xóa param nếu chọn "Tất cả danh mục"
          }
           params.set('page', 1); // Reset về trang 1 khi thay đổi danh mục
          return params;
      });
  };

   const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        // Có thể cập nhật URL param ngay khi gõ hoặc sau khi nhấn Enter/blur
        // Cập nhật sau khi gõ
        setSearchParams(params => {
            if(newSearchTerm) {
                params.set('search', newSearchTerm);
            } else {
                params.delete('search');
            }
            params.set('page', 1);
            return params;
        });
   };

  const handleSortChange = (e) => {
      const newSortTerm = e.target.value;
      setSearchParams(params => {
          params.set('sort', newSortTerm);
           params.set('page', 1); // Reset về trang 1
          return params;
      });
  };

  const handlePageChange = (newPage) => {
      setSearchParams(params => {
          params.set('page', newPage);
          return params;
      });
      // Tùy chọn: cuộn lên đầu trang sau khi đổi trang
      // window.scrollTo(0, 0);
  };


  // Hiển thị trạng thái tải hoặc lỗi
  if (loading && products.length === 0) { // Chỉ hiển thị loading nếu chưa có dữ liệu lần nào
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi tải sản phẩm.';
    return <div style={{ color: 'red' }}>Lỗi: {errorMessage}</div>;
  }


  return (
    <div className="product-list-page">
      <h1>Danh Sách Sản Phẩm</h1>

      {/* Khu vực bộ lọc và sắp xếp */}
      <div className="filter-sort-section">
          {/* Lọc theo Danh mục */}
          <div className="filter-group">
              <label htmlFor="categoryFilter">Danh mục:</label>
              <select
                  id="categoryFilter"
                  value={categoryId || ''} // Chọn option "Tất cả" nếu categoryId là null/undefined
                  onChange={(e) => handleCategoryChange(e.target.value)}
              >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                      </option>
                  ))}
              </select>
          </div>

           {/* Tìm kiếm */}
           <div className="filter-group">
                <label htmlFor="searchFilter">Tìm kiếm:</label>
                <input
                     type="text"
                     id="searchFilter"
                     value={searchTerm} // Giá trị input được điều khiển bởi URL param
                     onChange={handleSearchChange}
                     placeholder="Tìm kiếm theo tên sản phẩm..."
                />
           </div>


          {/* Sắp xếp */}
          <div className="filter-group">
              <label htmlFor="sortFilter">Sắp xếp:</label>
              <select
                  id="sortFilter"
                  value={sortTerm}
                  onChange={handleSortChange}
              >
                  <option value="created_at,desc">Mới nhất</option>
                  <option value="created_at,asc">Cũ nhất</option>
                  <option value="base_price,asc">Giá tăng dần</option>
                  <option value="base_price,desc">Giá giảm dần</option>
                   <option value="name,asc">Tên (A-Z)</option>
                   <option value="name,desc">Tên (Z-A)</option>
              </select>
          </div>
      </div>

      {/* Hiển thị loading khi đang fetch dữ liệu sau lần tải đầu */}
       {loading && products.length > 0 && <div>Đang cập nhật sản phẩm...</div>}


      {/* Danh sách sản phẩm */}
      {products.length === 0 && !loading ? ( // Chỉ hiển thị "Không có sản phẩm" khi không loading và list rỗng
        <p>Không có sản phẩm nào được tìm thấy với các tiêu chí đã chọn.</p>
      ) : (
        <div className="product-list-grid">
          {products.map(product => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      {/* Phân trang */}
       {pagination.totalPages > 1 && (
           <div className="pagination">
               <button
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage <= 1 || loading}
               >
                   Trước
               </button>
               <span>
                   Trang {pagination.currentPage} / {pagination.totalPages}
               </span>
                <button
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage >= pagination.totalPages || loading}
               >
                   Sau
               </button>
                <p>Tổng cộng {pagination.totalItems} sản phẩm.</p>
           </div>
       )}

    </div>
  );
}

export default ProductListPage;