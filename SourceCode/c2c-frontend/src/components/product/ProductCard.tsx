import { Link } from 'react-router-dom';
import { Star, Shield, BarChart } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface ProductCardProps {
  product: Product;
}

const API_URL = 'http://localhost:3000'; // URL của backend

const ProductCard = ({ product }: ProductCardProps) => {
  // Tạo URL đầy đủ cho ảnh
  const imageUrl = product.thumbnail_url 
    ? `${API_URL}${product.thumbnail_url}`
    : 'https://placehold.co/600x400';

  return (
    <Link to={`/san-pham/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-custom transition-all duration-300 hover:shadow-custom-lg">
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
            // Xử lý lỗi nếu ảnh không tải được
            
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-error-500 text-white text-xs font-bold rounded-full px-2 py-1">
              -{product.discount}%
            </div>
          )}
        </div>
        
        <div className="p-4">
          {/* ... phần còn lại của component không đổi */}
          <div className="mb-2 flex items-center">
            <span className={`badge ${getCategoryBadgeColor(product.category.id)}`}>
              {product.category.name}
            </span>
            <div className="ml-auto flex items-center text-accent-500">
              <Star size={14} className="fill-current" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors h-12 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <div>
              {product.discount > 0 ? (
                <div>
                  <span className="text-error-600 font-semibold">{formatCurrency(getDiscountedPrice(product))}</span>
                  <span className="text-gray-400 text-sm line-through ml-2">{formatCurrency(product.price)}</span>
                </div>
              ) : (
                <span className="text-gray-900 font-semibold">{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ... các hàm helper khác giữ nguyên
const getDiscountedPrice = (product: Product) => {
  return product.price - (product.price * product.discount) / 100;
};
const getCategoryBadgeColor = (categoryId: number) => {
  const colors = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-red'];
  return colors[categoryId % colors.length];
};

export default ProductCard;
