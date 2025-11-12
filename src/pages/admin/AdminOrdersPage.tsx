import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Eye, Trash2 } from 'lucide-react';

interface Order {
  _id: string;
  userId?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

interface AdminOrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminOrdersPage({ onNavigate }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // FIXED: Use environment-based API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD 
      ? 'https://astroskulture-website.onrender.com/api' 
      : 'http://localhost:5000/api'
    );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      setLoading(true);
      console.log('📦 Fetching orders from:', `${API_BASE_URL}/admin/orders`);
      
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📦 Orders response status:', response.status);
      
      const result = await response.json();
      
      if (result.success) {
        console.log('📦 Orders data received:', result.data?.length || 0, 'orders');
        setOrders(result.data || []);
      } else {
        console.error('Error fetching orders:', result.message);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      console.log('🔄 Updating order status:', { orderId, status });
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Order status updated successfully');
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        console.error('Error updating order status:', result.message);
        alert(result.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      console.log('🗑️ Deleting order:', orderId);
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Order deleted successfully');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        console.error('Error deleting order:', result.message);
        alert(result.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <AdminLayout currentPage="orders" onNavigate={onNavigate}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-slate-600">Loading orders...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="orders" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <button
            onClick={fetchOrders}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Refresh Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No orders found.</p>
              <button 
                onClick={fetchOrders}
                className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Retry Loading Orders
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {order.userId
                        ? `${order.userId.firstName} ${order.userId.lastName}`
                        : order.shippingAddress?.fullName || 'Guest'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-slate-600 hover:text-slate-900 mr-3 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="View order details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Order Information</h3>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Total:</span> ${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Shipping Address</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}