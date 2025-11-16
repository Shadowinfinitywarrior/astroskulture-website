import { useState, useEffect } from "react";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  name: string;
  price: number;
  quantity: number;
  size: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    flatHouseNumber: string;
    areaStreetSector: string;
    landmark: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export function OrderConfirmationPage({ 
  orderId, 
  onNavigate 
}: { 
  orderId: string;
  onNavigate: (path: string, params?: any) => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingActive, setPollingActive] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      const pollInterval = setInterval(fetchOrderDetails, 3000);
      
      return () => {
        clearInterval(pollInterval);
        setPollingActive(false);
      };
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setOrder(result.data);
        setLoading(false);
        
        if (result.data.paymentStatus === "paid") {
          setPollingActive(false);
        }
      } else if (response.status === 404) {
        setError("Order not found");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      if (!order) {
        setError("Failed to fetch order details");
        setLoading(false);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "✓";
      case "failed":
        return "✗";
      case "pending":
        return "⏳";
      default:
        return "•";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Processing your order...</p>
            {pollingActive && (
              <p className="text-sm text-gray-500 mt-2">
                Waiting for payment confirmation...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                {error}
              </h1>
              <button
                onClick={() => onNavigate("/orders")}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Order details not available</p>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center mb-8">
            {isPaid ? (
              <>
                <div className="text-5xl mb-4">✓</div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-gray-600 mb-2">
                  Thank you for your purchase
                </p>
                <p className="text-sm text-gray-500">
                  Order #{order.orderNumber}
                </p>
              </>
            ) : isFailed ? (
              <>
                <div className="text-5xl mb-4">✗</div>
                <h1 className="text-3xl font-bold text-red-600 mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600">Please try again</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4 animate-pulse">⏳</div>
                <h1 className="text-3xl font-bold text-yellow-600 mb-2">
                  Payment Processing
                </h1>
                <p className="text-gray-600">
                  We're confirming your payment...
                </p>
              </>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                <p className="font-semibold capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className={`font-semibold capitalize ${getStatusColor(order.paymentStatus)}`}>
                  {getStatusIcon(order.paymentStatus)} {order.paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="font-semibold">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.productId.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Size: {item.size} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>₹{order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (GST)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.flatHouseNumber}</p>
            <p>{order.shippingAddress.areaStreetSector}</p>
            {order.shippingAddress.landmark && (
              <p>Near: {order.shippingAddress.landmark}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {isPaid ? (
            <>
              <button
                onClick={() => onNavigate("/orders")}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                View My Orders
              </button>
              <button
                onClick={() => onNavigate("/shop")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </>
          ) : isFailed ? (
            <>
              <button
                onClick={() => onNavigate("/checkout")}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => onNavigate("/cart")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
              >
                Back to Cart
              </button>
            </>
          ) : (
            <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center">
              <p>Please keep this page open while we confirm your payment...</p>
              <p className="text-sm mt-1">
                You can also check your order status in "My Orders"
              </p>
            </div>
          )}
        </div>

        {!isPaid && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-sm text-blue-800">
            <p>📧 A confirmation email will be sent once your payment is verified</p>
          </div>
        )}
      </div>
    </div>
  );
}
