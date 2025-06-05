import { Link } from 'react-router-dom';
import { Clock, Star, Shield, BarChart } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/san-pham/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-custom transition-all duration-300 hover:shadow-custom-lg">
        <div className="relative">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-error-500 text-white text-xs font-bold rounded-full px-2 py-1">
              -{product.discount}%
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-2 flex items-center">
            <span className={`badge ${getCategoryBadgeColor(product.category.id)}`}>
              {product.category.name}
            </span>
            <div className="ml-auto flex items-center text-accent-500">
              <Star size={14} className="fill-current" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center text-gray-500 text-sm">
              {product.inStock > 0 ? (
                <span className="flex items-center text-secondary-600">
                  <Shield size={14} className="mr-1" />
                  Còn hàng
                </span>
              ) : (
                <span className="flex items-center text-error-600">
                  <Clock size={14} className="mr-1" />
                  Hết hàng
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-2 border-t pt-2">
            <BarChart size={12} className="mr-1" />
            <span>Đã bán: {product.sold}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Tính giá sau khi giảm giá
const getDiscountedPrice = (product: Product) => {
  return product.price - (product.price * product.discount) / 100;
};

// Màu badge theo danh mục
const getCategoryBadgeColor = (categoryId: number) => {
  const colors = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-red'];
  return colors[categoryId % colors.length];
};

export default ProductCard;