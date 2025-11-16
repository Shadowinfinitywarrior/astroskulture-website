import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../lib/mongodb";
import type { Address } from "../lib/types";

interface CheckoutForm {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
}

interface RazorpayCheckout {
  key_id: string;
  order_id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  email: string;
  contact: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { items, clearCart, cartTotal } = useCart();
  const { user, addAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string>("new");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  const [formData, setFormData] = useState<CheckoutForm>({
    email: user?.email || "",
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    saveAddress: true
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (keyId) {
      setRazorpayKeyId(keyId);
    } else {
      console.warn('Razorpay Key ID not configured');
    }
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setSelectedAddress("new");
      setFormData(prev => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India"
      }));
    } else {
      setSelectedAddress(addressId);
      const address = user?.addresses.find(addr => addr._id === addressId);
      if (address) {
        setFormData(prev => ({
          ...prev,
          fullName: address.fullName,
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        }));
      }
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      setLoading(true);
      setError("");

      const orderId = localStorage.getItem('currentOrderId');
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      const verifyResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payments/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          })
        }
      );

      const result = await verifyResponse.json();

      if (result.success) {
        localStorage.removeItem('currentOrderId');
        clearCart();
        onNavigate(`/order-confirmation/${orderId}`);
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = async (error: any) => {
    try {
      const orderId = localStorage.getItem('currentOrderId');
      if (orderId) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/payments/failure`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              orderId,
              razorpayPaymentId: error?.razorpay_payment_id || null,
              reason: error?.reason || 'Unknown error'
            })
          }
        );
        localStorage.removeItem('currentOrderId');
      }
    } catch (err) {
      console.error('Error recording payment failure:', err);
    }
    setError('Payment failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!razorpayKeyId) {
        throw new Error('Razorpay is not configured. Please contact support.');
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          size: item.size
        })),
        subtotal: cartTotal,
        tax: Math.round(cartTotal * 0.18),
        shipping: cartTotal > 999 ? 0 : 69,
        total: cartTotal + Math.round(cartTotal * 0.18) + (cartTotal > 999 ? 0 : 69),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentStatus: 'pending' as const
      };

      const orderResponse = await apiService.createOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderId = orderResponse.data._id;
      localStorage.setItem('currentOrderId', orderId);

      const paymentOrderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payments/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            orderId,
            amount: orderResponse.data.total,
            currency: 'INR'
          })
        }
      );

      const paymentOrderData = await paymentOrderResponse.json();

      if (!paymentOrderData.success) {
        throw new Error(paymentOrderData.message || 'Failed to create payment order');
      }

      const options: RazorpayCheckout = {
        key_id: razorpayKeyId,
        order_id: paymentOrderData.data.id,
        name: 'Astro Skulture',
        description: `Order #${orderResponse.data.orderNumber}`,
        amount: paymentOrderData.data.amount,
        currency: paymentOrderData.data.currency,
        email: formData.email,
        contact: formData.phone,
        handler: handlePaymentSuccess,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#ef4444'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', handlePaymentFailure);
      razorpay.open();

      if (formData.saveAddress && user && selectedAddress === "new") {
        try {
          await addAddress({
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            isDefault: user.addresses.length === 0
          });
        } catch (addrError) {
          console.error('Failed to save address:', addrError);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process order');
      localStorage.removeItem('currentOrderId');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = cartTotal > 999 ? 0 : 69;
  const tax = Math.round(cartTotal * 0.18);
  const finalTotal = cartTotal + tax + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <button
              onClick={() => onNavigate('/shop')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form or Login Prompt */}
          {!user ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please log in to complete your purchase</p>
                <button
                  onClick={() => onNavigate('/login')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 mb-4 font-medium"
                >
                  Log In
                </button>
                <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                <button
                  onClick={() => onNavigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Sign Up Here
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

            {user && user.addresses.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Address
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="new">Add New Address</option>
                  {user.addresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {address.fullName} - {address.city}, {address.state}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {user && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Save this address for future orders
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Pay ₹${finalTotal}`}
              </button>
            </form>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-gray-500 text-sm">Size: {item.size}</p>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    ₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
