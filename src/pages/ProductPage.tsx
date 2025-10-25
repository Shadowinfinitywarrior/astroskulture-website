import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../lib/types';
import ProductImageGallery from '../components/ProductImageGallery';

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.getProductBySlug(slug);
      
      if (data.success && data.data) {
        setProduct(data.data);
        // Set default size to first available size
        const availableSizes = data.data.sizes
          .filter(size => size.stock > 0)
          .map(size => size.size);
        
        if (availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const selectedSizeData = product.sizes.find(size => size.size === selectedSize);
    if (!selectedSizeData || selectedSizeData.stock === 0) {
      alert('Selected size is out of stock');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0]?.url || '',
      quantity: 1,
      size: selectedSize,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onNavigate('checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{error || 'Product not found'}</p>
          <button 
            onClick={() => onNavigate('shop')} 
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes
    .filter(size => size.stock > 0)
    .map(size => size.size);

  const currentPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  // Get category name - handle both category and categoryData
  const categoryName = product.categoryData?.name || product.category?.name || 'ASTROSKULTURE';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery 
              images={product.images} 
              productName={product.name} 
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="space-y-2">
              <span className="text-sm text-red-600 font-medium uppercase tracking-wide">
                {categoryName}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-700">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{currentPrice}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="prose prose-gray">
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Premium quality product with excellent craftsmanship and attention to detail.'}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Select Size
                </label>
                <button className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((sizeData) => (
                  <button
                    key={sizeData.size}
                    onClick={() => setSelectedSize(sizeData.size)}
                    disabled={sizeData.stock === 0}
                    className={`px-6 py-3 border-2 rounded-lg font-medium transition-all min-w-[60px] ${
                      selectedSize === sizeData.size
                        ? 'border-red-600 bg-red-600 text-white'
                        : sizeData.stock > 0
                        ? 'border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {sizeData.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.totalStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({product.totalStock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleAddToCart} 
                disabled={product.totalStock === 0 || !selectedSize}
                className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.totalStock === 0 || !selectedSize}
                className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Buy Now
              </button>
              <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-3 text-gray-600">
                <Truck className="w-5 h-5 text-red-600" />
                <span className="text-sm">Free delivery on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <RefreshCw className="w-5 h-5 text-red-600" />
                <span className="text-sm">7-day easy return policy</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="text-sm">100% authentic products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}