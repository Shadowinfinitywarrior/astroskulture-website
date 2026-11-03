import { Trash2, Plus, Minus, Tag, Truck, Check, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useEffect, useState } from 'react';
import { apiService } from '../lib/mongodb';
import { trackEcommerce } from '../lib/analytics';

interface AppSettings {
  gstPercentage: number;
  gstEnabled: boolean;
  shippingFee: number;
  shippingEnabled: boolean;
  freeShippingAbove: number;
}

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [settings, setSettings] = useState < AppSettings > ({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 0,
    shippingEnabled: true,
    freeShippingAbove: 999,
  });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    loadSettings();
    if (items.length > 0) {
      trackEcommerce('view_item', items.map(i => ({
        id: `${i.productId}_${i.size}`,
        groupId: i.productId,
        name: i.name,
        price: i.discountPrice || i.price,
        quantity: i.quantity,
        variant: i.size,
      })), { value: total, contentType: 'product' });
    }
  }, []);

  const loadSettings = async () => {
    try {
      const result = await apiService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (code === 'ASTROS240' || code === 'STREETWEAR10') {
      const discount = Math.round(subtotal * 0.10);
      setAppliedCoupon({ code, discount });
      setCouponSuccess(`10% discount applied! You saved ₹${discount}`);
      setCouponInput('');
    } else if (code === 'WELCOME50') {
      const discount = Math.min(50, subtotal);
      setAppliedCoupon({ code, discount });
      setCouponSuccess(`₹50 welcome discount applied!`);
      setCouponInput('');
    } else if (code === 'FLAT100') {
      if (subtotal < 999) {
        setCouponError('FLAT100 is valid only on orders above ₹999');
        return;
      }
      setAppliedCoupon({ code, discount: 100 });
      setCouponSuccess('₹100 flat discount applied!');
      setCouponInput('');
    } else {
      setCouponError('Invalid promo code. Try ASTROS240 or WELCOME50');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const subtotal = cartTotal;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  let gst = 0;
  if (settings.gstEnabled) {
    gst = items.reduce((sum, item) => {
      if (item.gstApplicable === false) {
        return sum;
      }
      const itemSubtotal = (item.discountPrice || item.price) * item.quantity;
      const itemGst = Math.round(itemSubtotal * ((item.gstPercentage || settings.gstPercentage) / 100));
      return sum + itemGst;
    }, 0);
  }
  let shipping = 0;
  if (settings.shippingEnabled) {
    shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFee;
  }
  const total = Math.max(0, subtotal - couponDiscount + gst + shipping);

  const freeShippingThreshold = settings.freeShippingAbove || 999;
  const freeShippingDiff = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-500 text-sm md:text-lg mb-4">Your cart is empty</p>
          <button onClick={() => onNavigate('shop')} className="btn-primary text-sm md:text-base">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm py-4 md:py-8 mb-6 md:mb-8">
        <div className="container-custom px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold">Shopping Cart</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-2">{cartCount} items in your cart</p>
        </div>
      </div>

      <div className="container-custom px-4 md:px-6 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color || ''}`} className="bg-white rounded-lg shadow-sm p-3 md:p-6">
                <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Size: {item.size} {item.color && `| Color: ${item.color}`}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-base md:text-lg font-bold text-gray-900">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex-shrink-0"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                    </button>
                    <div className="flex items-center space-x-1 md:space-x-2 border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                        className="p-1 md:p-2 hover:bg-gray-100 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 md:w-4 h-3 md:h-4" />
                      </button>
                      <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
                        className="p-1 md:p-2 hover:bg-gray-100 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 md:w-4 h-3 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-4">
            {/* Free Shipping Progress Meter */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  {freeShippingDiff === 0 ? (
                    <span className="text-emerald-700 font-bold">🎉 You've unlocked FREE Shipping!</span>
                  ) : (
                    <span>Add <strong className="text-red-600">₹{freeShippingDiff.toFixed(0)}</strong> more for <strong>FREE Shipping</strong></span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    freeShippingPercent >= 100 ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>

            {/* Coupon / Voucher Box */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Tag className="w-4 h-4 text-red-600" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
                  Have a Promo Code?
                </h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-[11px] text-emerald-700">Saved ₹{appliedCoupon.discount}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ASTROS240, WELCOME50"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs uppercase bg-gray-50 focus:bg-white border border-gray-300 focus:border-red-500 rounded-lg outline-none font-semibold tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-24 border border-gray-100">
              <h2 className="font-heading font-semibold text-lg md:text-xl mb-4 md:mb-6">Order Summary</h2>
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs md:text-sm text-emerald-700 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {settings.gstEnabled && (
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">GST ({settings.gstPercentage}%)</span>
                    <span className="font-medium">₹{gst.toFixed(2)}</span>
                  </div>
                )}
                {settings.shippingEnabled && (
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shipping}`}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 md:pt-3 flex justify-between text-base md:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full btn-primary text-sm md:text-base cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full btn-secondary mt-2 md:mt-3 text-sm md:text-base cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
