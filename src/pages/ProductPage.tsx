import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, ArrowLeft, Check, X } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../lib/types';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReviews from '../components/ProductReviews';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { trackEcommerce } from '../lib/analytics';
import { updatePageSeo } from '../utils/seoUtils';

interface AppSettings {
  gstPercentage: number;
  gstEnabled: boolean;
  shippingFee: number;
  shippingEnabled: boolean;
  freeShippingAbove: number;
}

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 0,
    shippingEnabled: true,
    freeShippingAbove: 999,
  });
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, operationLoading } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    loadProduct();
    loadSettings();
  }, [slug]);

  const loadSettings = async () => {
    try {
      const result = await apiService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Keep default settings if loading fails
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiService.getProductBySlug(slug);

      if (data.success && data.data) {
        setProduct(data.data);
        
        // TRK-05: Track ViewContent / view_item
        const prod = data.data;
        const effectivePrice = prod.discountPrice && prod.discountPrice > 0 && prod.discountPrice < prod.price
          ? prod.discountPrice
          : prod.price;

        trackEcommerce('view_item', [
          {
            id: prod._id,
            groupId: prod._id,
            name: prod.name,
            price: effectivePrice,
            category: prod.category || 'Oversized T-Shirts',
          }
        ], { contentType: 'product_group' });

        // Dynamic SEO & Structured Data (Product + BreadcrumbList Schema)
        const primaryImg = prod.images?.[0]?.url || 'https://astroskulture.in/logo.png';
        const inStock = (prod.totalStock !== undefined ? prod.totalStock > 0 : true) || 
          (Array.isArray(prod.sizes) && prod.sizes.some((s: any) => s.stock > 0));

        const structuredData = [
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": prod.name,
            "image": prod.images?.map((img: any) => img.url) || [primaryImg],
            "description": prod.description || `Buy ${prod.name} at Astros Kulture. Premium streetwear and high quality oversized t-shirt.`,
            "sku": String(prod._id),
            "mpn": String(prod._id),
            "brand": {
              "@type": "Brand",
              "name": "ASTROS KULTURE"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://astroskulture.in/product/${prod.slug}`,
              "priceCurrency": "INR",
              "price": effectivePrice.toFixed(2),
              "priceValidUntil": "2027-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "ASTROS KULTURE"
              },
              "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "IN",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
              },
              "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": "0.00",
                  "currency": "INR"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "IN"
                },
                "deliveryTime": {
                  "@type": "ShippingDeliveryTime",
                  "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 2,
                    "unitCode": "d"
                  },
                  "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 3,
                    "maxValue": 5,
                    "unitCode": "d"
                  }
                }
              }
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://astroskulture.in"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": prod.category || "Shop",
                "item": "https://astroskulture.in/shop"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": prod.name,
                "item": `https://astroskulture.in/product/${prod.slug}`
              }
            ]
          }
        ];

        updatePageSeo({
          title: `${prod.name} | ASTROS KULTURE`,
          description: prod.description || `Buy ${prod.name} - Premium oversized graphic t-shirt crafted from heavy-gauge luxury cotton by ASTROS KULTURE. Free shipping available.`,
          canonicalUrl: `https://astroskulture.in/product/${prod.slug}`,
          ogImage: primaryImg,
          ogType: 'product',
          ogPrice: {
            amount: effectivePrice,
            currency: 'INR'
          },
          structuredData
        });

        // Set default size to first available size
        const availableSizes = data.data.sizes
          .filter((size: any) => size.stock > 0)
          .map((size: any) => size.size);

        if (availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        }

        // Set default color
        if (data.data.colors && data.data.colors.length > 0) {
          setSelectedColor(data.data.colors[0]);
        }

        // Fetch suggestions for upsell/cross-sell
        try {
          const sugRes = await apiService.getProducts({ limit: 12 });
          if (sugRes && sugRes.success) {
            const list = Array.isArray(sugRes.data) ? sugRes.data : (sugRes.data?.products || []);
            const others = list.filter((p: any) => p._id !== data.data._id && p.slug !== slug);
            setSuggestedProducts(others.slice(0, 6));
          }
        } catch (e) {
          console.error('Failed to load suggestions:', e);
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

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeStatus({ type: 'error', message: 'Please enter a valid 6-digit Indian pincode.' });
      return;
    }
    setPincodeStatus({
      type: 'success',
      message: `Delivery available to ${clean} in 4–6 business days. Cash on delivery & Gift packing available.`
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedSizeData = product.sizes.find(size => size.size === selectedSize);
    if (!selectedSizeData || selectedSizeData.stock === 0) {
      alert('Selected size is out of stock');
      return;
    }

    const giftExtra = isGiftWrapped ? 49 : 0;
    const finalPrice = product.price + giftExtra;
    const finalDiscountPrice = product.discountPrice ? (product.discountPrice + giftExtra) : undefined;

    addToCart({
      productId: product._id,
      name: product.name + (isGiftWrapped ? ' (Gift Wrapped)' : ''),
      price: finalPrice,
      discountPrice: finalDiscountPrice,
      gstPercentage: product.gstPercentage || settings.gstPercentage || 18,
      gstApplicable: product.gstApplicable !== undefined ? product.gstApplicable : true,
      shippingFee: product.shippingFee !== undefined ? product.shippingFee : settings.shippingFee,
      freeShippingAbove: product.freeShippingAbove !== undefined ? product.freeShippingAbove : settings.freeShippingAbove,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0]?.url || '',
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // TRK-05: Track AddToCart / add_to_cart
    const effectivePrice = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice + giftExtra
      : product.price + giftExtra;

    trackEcommerce('add_to_cart', [
      {
        id: `${product._id}_${selectedSize}`,
        groupId: product._id,
        name: product.name,
        price: effectivePrice,
        quantity: 1,
        variant: selectedSize,
        category: product.category,
      }
    ]);
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please login or sign up to proceed with your purchase');
      localStorage.setItem('returnToProduct', slug);
      onNavigate('login');
      return;
    }
    handleAddToCart();
    onNavigate('checkout');
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
        const effectivePrice = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
        trackEcommerce('add_to_wishlist', [
          {
            id: String(product._id),
            groupId: String(product._id),
            name: product.name,
            price: effectivePrice,
            category: product.category,
          }
        ]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Error is handled in the context
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
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

  const currentPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  // Get category name - handle both category object and categoryData
  const categoryName = product.categoryData?.name ||
    (typeof product.category === 'object' && product.category?.name) ||
    'Uncategorized';
  const isProductInWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8">
        {/* Navigation - Arrow icon only */}
        <button
          onClick={() => onNavigate('shop')}
          className="p-2 -ml-1 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-all group mb-4 inline-flex items-center justify-center w-10 h-10 border border-gray-200/80 shadow-sm"
          title="Back to Shop"
          aria-label="Back to Shop"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="min-w-0 order-1 lg:order-1">
            <ProductImageGallery
              images={
                selectedColor && product.colorVariants?.find(v => v.color === selectedColor)
                  ? product.colorVariants.find(v => v.color === selectedColor)!.images
                  : product.images
              }
              productName={product.name}
              isWishlist={isProductInWishlist}
              onWishlistToggle={handleWishlistToggle}
              isWishlistLoading={operationLoading}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6 order-2 lg:order-2">
            {/* Category & Brand */}
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs text-red-600 font-medium uppercase tracking-wide">
                {categoryName}
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 md:w-4 h-3.5 md:h-4 ${i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-700">{product.rating && product.rating % 1 === 0 ? Math.round(product.rating) : (product.rating || 0).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
            </div>

            {/* Pricing */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-baseline space-x-1.5 md:space-x-2 flex-wrap">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{currentPrice}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-base md:text-lg text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              {settings.gstEnabled && product.gstApplicable !== false && (
                <p className="text-xs text-gray-600">Inclusive of all taxes</p>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-gray">
              <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                {product.description || 'Premium quality product with excellent craftsmanship and attention to detail.'}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Select Size
                </label>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {product.sizes.map((sizeData) => (
                  sizeData.stock > 0 && (
                    <button
                      key={sizeData.size}
                      onClick={() => setSelectedSize(sizeData.size)}
                      className={`px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 border-2 rounded-lg font-medium transition-all min-w-[44px] sm:min-w-[50px] md:min-w-[60px] relative text-xs md:text-sm ${selectedSize === sizeData.size
                        ? 'border-red-600 bg-red-600 text-white shadow-md'
                        : 'border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700 hover:shadow-md'
                        }`}
                    >
                      {sizeData.size}
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 border-2 rounded-lg text-xs md:text-sm font-medium transition-all ${selectedColor === color
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-600 hover:border-red-600'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-1.5 md:space-x-2">
              {product.totalStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">
                    In Stock ({product.totalStock})
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Gift Packing Option */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGiftWrapped}
                  onChange={(e) => setIsGiftWrapped(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">🎁 Add gift packing (+₹49)</span>
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">GIFT READY</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    Gift wrapped, invoice concealed from parcel, free custom message card included.
                  </p>
                </div>
              </label>

              {isGiftWrapped && (
                <div className="pt-2 border-t border-gray-200">
                  <label htmlFor="giftMessage" className="block text-xs font-medium text-gray-700 mb-1">
                    Gift message (max 150 characters):
                  </label>
                  <textarea
                    id="giftMessage"
                    rows={2}
                    maxLength={150}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enter message for the recipient..."
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white"
                  />
                  <div className="text-[10px] text-gray-400 text-right">
                    {giftMessage.length}/150
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Action Buttons (Hidden on mobile because bottom bar is docked) */}
            <div className="hidden md:flex flex-col sm:flex-row gap-2 md:gap-4 items-center">
              <button
                onClick={handleAddToCart}
                disabled={product.totalStock === 0 || !selectedSize || (product.colors && product.colors.length > 0 && !selectedColor) || isAdded}
                className={`w-full sm:flex-1 py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors flex items-center justify-center font-medium shadow-sm text-sm md:text-base ${isAdded
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                    <span className="hidden xs:inline">Added to Cart</span>
                    <span className="inline xs:hidden">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                    <span className="hidden xs:inline">Add to Cart</span>
                    <span className="inline xs:hidden">Add</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.totalStock === 0 || !selectedSize || (product.colors && product.colors.length > 0 && !selectedColor)}
                className="w-full sm:flex-1 bg-red-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm md:text-base"
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist Feedback */}
            {isProductInWishlist && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                <p className="text-green-800 text-xs md:text-sm flex items-center">
                  <Heart className="w-3 md:w-4 h-3 md:h-4 fill-current mr-2" />
                  This product is in your wishlist
                </p>
              </div>
            )}

            {/* Check Delivery & Pincode Serviceability */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
              <span className="font-semibold text-xs md:text-sm text-gray-900 block">
                Check Delivery & COD Availability
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className={`text-xs font-medium ${pincodeStatus.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                  {pincodeStatus.message}
                </p>
              )}
            </div>

            {/* Trust Badges Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
              <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-2.5">
                <span className="block font-bold text-gray-900">🎁 Gift Ready</span>
                <span className="text-[11px] text-gray-500">Wrap + Card</span>
              </div>
              <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-2.5">
                <span className="block font-bold text-gray-900">7-Day</span>
                <span className="text-[11px] text-gray-500">Easy Exchange</span>
              </div>
              <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-2.5">
                <span className="block font-bold text-gray-900">Secure</span>
                <span className="text-[11px] text-gray-500">UPI, Cards, COD</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <h3 className="font-semibold text-sm md:text-base text-gray-900">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs md:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> 100% Combed Heavy Cotton (240 GSM)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Signature streetwear oversized fit
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Durable high-definition artwork
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Pre-shrunk bio-washed fabric
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Sizes S to XXL available
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Proudly Made in India
                </li>
              </ul>
            </div>

            {/* Gifting Section */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs md:text-sm text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-950">
                🎁 Perfect for Gifting
              </span>
              <p className="text-amber-800 leading-relaxed text-xs">
                Ideal gift for birthdays, match days, anime lovers & celebrations. Tick gift packing, write your message, and ship straight to the recipient's address. Price and invoice remain strictly concealed from the parcel!
              </p>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <details className="group border border-gray-200 rounded-lg p-3 open:bg-gray-50/50 transition-colors" open>
                <summary className="font-semibold text-xs md:text-sm text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>Product Details & Fabric Care</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-600 space-y-1.5">
                  <p>• <strong>Material:</strong> 100% Super Combed Bio-Washed Cotton (240 GSM)</p>
                  <p>• <strong>Fit:</strong> Oversized comfort drop-shoulder cut with ribbed crew neck</p>
                  <p>• <strong>Care:</strong> Machine wash cold with like colors, wash inside out, do not bleach or iron directly over printed graphics.</p>
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg p-3 open:bg-gray-50/50 transition-colors">
                <summary className="font-semibold text-xs md:text-sm text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>Shipping, Gift Packing & Returns</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-600 space-y-1.5">
                  <p>• <strong>Dispatch:</strong> Dispatched in 1–2 working days with live tracking link via SMS/WhatsApp.</p>
                  <p>• <strong>Delivery:</strong> 4–6 business days across India. Free shipping on orders above ₹{settings.freeShippingAbove}.</p>
                  <p>• <strong>Gift Packing:</strong> ₹49 only, includes gift wrapping + customized message card.</p>
                  <p>• <strong>Exchange Policy:</strong> 7-day hassle-free size exchange if unworn, unwashed with original tags attached.</p>
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg p-3 open:bg-gray-50/50 transition-colors">
                <summary className="font-semibold text-xs md:text-sm text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>Frequently Asked Questions (FAQ)</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-600 space-y-2">
                  <div>
                    <p className="font-medium text-gray-900">Q: Can I send it directly to someone as a surprise gift?</p>
                    <p className="text-gray-600">Yes! Enter the receiver's address at checkout, tick "Add gift packing", and add your message. The price is not shown in the parcel.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Q: What sizes are available?</p>
                    <p className="text-gray-600">Available in S, M, L, XL, and XXL. If you are between sizes or prefer an oversized streetwear look, choose your regular size.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Q: How can I exchange if the size does not fit?</p>
                    <p className="text-gray-600">Simply reach out to support within 7 days of delivery for a seamless size exchange.</p>
                  </div>
                </div>
              </details>
            </div>

            {/* Product Details Specs */}
            <div className="space-y-2 md:space-y-3 border-t border-gray-200 pt-3 md:pt-4">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-2 md:mb-3">Specifications</h3>
              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                {product.materialComposition && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Material composition</span>
                    <span className="text-gray-900">{product.materialComposition}</span>
                  </div>
                )}
                {product.pattern && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Pattern</span>
                    <span className="text-gray-900">{product.pattern}</span>
                  </div>
                )}
                {product.fitType && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Fit type</span>
                    <span className="text-gray-900">{product.fitType}</span>
                  </div>
                )}
                {product.sleeveType && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Sleeve type</span>
                    <span className="text-gray-900">{product.sleeveType}</span>
                  </div>
                )}
                {product.collarStyle && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Collar style</span>
                    <span className="text-gray-900">{product.collarStyle}</span>
                  </div>
                )}
                {product.neckStyle && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Neck style</span>
                    <span className="text-gray-900">{product.neckStyle}</span>
                  </div>
                )}
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Country of Origin</span>
                  <span className="text-gray-900">{product.countryOfOrigin || 'India'}</span>
                </div>
              </div>
            </div>

            {/* Delivery and Guarantee Badges */}
            <div className="space-y-2 md:space-y-3 border-t border-gray-200 pt-3 md:pt-4">
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <Truck className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">Free delivery on orders above ₹{settings.freeShippingAbove}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <RefreshCw className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">7-day easy return and exchange policy</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <Shield className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">100% authentic products</span>
              </div>
            </div>

            {/* About this item */}
            <div className="border-t border-gray-200 pt-3 md:pt-4">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-2 md:mb-3">About this item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                <div>
                  <span className="font-medium text-gray-900">Category:</span>{' '}
                  {categoryName}
                </div>
                {product.brand && (
                  <div>
                    <span className="font-medium text-gray-900">Brand:</span>{' '}
                    {product.brand}
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="font-medium text-gray-900">Material:</span>{' '}
                    {product.material}
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">SKU:</span>{' '}
                  {product.slug.toUpperCase()}
                </div>
                {product.fits && product.fits.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900">Available Fits:</span>{' '}
                    {product.fits.join(', ')}
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Availability:</span>{' '}
                  {product.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Rating:</span>{' '}
                  {product.rating && product.rating % 1 === 0 ? `${Math.round(product.rating)}/5` : `${product.rating?.toFixed(1)}/5`} ({product.reviewCount})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell & Cross-Sell Recommendations */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-gray-200 pt-8 md:pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
              <div>
                <span className="text-xs uppercase font-extrabold text-red-600 tracking-wider">Complete Your Look</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-1">
                  You May Also Like
                </h2>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 underline"
              >
                View all streetwear drops →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {suggestedProducts.slice(0, 4).map((item) => {
                const itemPrice = item.discountPrice || item.price;
                const itemDiscount = item.discountPrice
                  ? Math.round((1 - item.discountPrice / item.price) * 100)
                  : 0;
                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      onNavigate('product', { slug: item.slug });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={item.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {itemDiscount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {itemDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          {typeof item.category === 'object' ? item.category?.name : (item.category || 'Streetwear')}
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 mt-0.5">
                          {item.name}
                        </h3>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm sm:text-base text-gray-900">₹{itemPrice}</span>
                          {item.discountPrice && (
                            <span className="text-[11px] text-gray-400 line-through">₹{item.price}</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-red-600 group-hover:translate-x-0.5 transition-transform">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Reviews Section */}
        <div className="mt-8 md:mt-12">
          <ProductReviews productId={product._id} />
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Docked & immediately accessible on mobile without scrolling) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              ₹{currentPrice + (isGiftWrapped ? 49 : 0)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price + (isGiftWrapped ? 49 : 0)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-gray-500 truncate">
            {selectedSize ? `Size: ${selectedSize}${isGiftWrapped ? ' · Gift' : ''}` : 'Select a size'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              if (!selectedSize) {
                alert('Please pick your size first');
                window.scrollTo({ top: 380, behavior: 'smooth' });
                return;
              }
              handleAddToCart();
            }}
            disabled={product.totalStock === 0 || isAdded}
            className={`px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 ${
              isAdded 
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (!selectedSize) {
                alert('Please pick your size first');
                window.scrollTo({ top: 380, behavior: 'smooth' });
                return;
              }
              handleBuyNow();
            }}
            disabled={product.totalStock === 0}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:bg-gray-400"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Size Guide (Inches)</h3>
              <button
                onClick={() => setShowSizeChart(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {product.sizeChart ? (
                product.sizeChart.startsWith('http') ? (
                  <div className="flex justify-center">
                    <img
                      src={product.sizeChart}
                      alt="Size Chart"
                      className="max-w-full h-auto rounded-lg shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-size-chart.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">
                    {product.sizeChart}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-center border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-800">
                          <th className="py-2.5 px-3 border border-gray-200 font-semibold">Size</th>
                          <th className="py-2.5 px-3 border border-gray-200 font-semibold">Chest (Inches)</th>
                          <th className="py-2.5 px-3 border border-gray-200 font-semibold">Length (Inches)</th>
                          <th className="py-2.5 px-3 border border-gray-200 font-semibold">Shoulder (Inches)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">S</td>
                          <td className="py-2 px-3 border border-gray-200">38</td>
                          <td className="py-2 px-3 border border-gray-200">26</td>
                          <td className="py-2 px-3 border border-gray-200">18</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">M</td>
                          <td className="py-2 px-3 border border-gray-200">40</td>
                          <td className="py-2 px-3 border border-gray-200">27</td>
                          <td className="py-2 px-3 border border-gray-200">19</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">L</td>
                          <td className="py-2 px-3 border border-gray-200">42</td>
                          <td className="py-2 px-3 border border-gray-200">28</td>
                          <td className="py-2 px-3 border border-gray-200">20</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">XL</td>
                          <td className="py-2 px-3 border border-gray-200">44</td>
                          <td className="py-2 px-3 border border-gray-200">29</td>
                          <td className="py-2 px-3 border border-gray-200">21</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-gray-200 font-bold text-gray-900">XXL</td>
                          <td className="py-2 px-3 border border-gray-200">46</td>
                          <td className="py-2 px-3 border border-gray-200">30</td>
                          <td className="py-2 px-3 border border-gray-200">22</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 italic text-center">
                    Tip: Our t-shirts feature a comfortable modern streetwear cut. If you are between sizes, choose your regular size for an oversized look or size down for a slimmer fit.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowSizeChart(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}