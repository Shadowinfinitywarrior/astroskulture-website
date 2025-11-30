import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useEffect, useState } from 'react';
import { apiService } from '../lib/mongodb';

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
  const [settings, setSettings] = useState<AppSettings>({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 69,
    shippingEnabled: true,
    freeShippingAbove: 999,
  });

  useEffect(() => {
    loadSettings();
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

  const subtotal = cartTotal;
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
  const total = subtotal + gst + shipping;

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
              <div key={`${item.productId}-${item.size}`} className="bg-white rounded-lg shadow-sm p-3 md:p-6">
                <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Size: {item.size}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-base md:text-lg font-bold text-gray-900">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex-shrink-0"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                    </button>
                    <div className="flex items-center space-x-1 md:space-x-2 border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="p-1 md:p-2 hover:bg-gray-100 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 md:w-4 h-3 md:h-4" />
                      </button>
                      <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-lg md:text-xl mb-4 md:mb-6">Order Summary</h2>
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">GST ({settings.gstPercentage}%)</span>
                  <span className="font-medium">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {subtotal < settings.freeShippingAbove && (
                  <p className="text-xs text-red-600">
                    Add ₹{(settings.freeShippingAbove - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-200 pt-2 md:pt-3 flex justify-between text-base md:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full btn-primary text-sm md:text-base"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full btn-secondary mt-2 md:mt-3 text-sm md:text-base"
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
