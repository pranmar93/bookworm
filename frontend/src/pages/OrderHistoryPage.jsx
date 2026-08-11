import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import { formatDate, formatDeliveryDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrderHistoryPage = () => {
  const { orders, loading, error, refetch } = useOrders();
  const { fetchCart } = useCart();
  const [expandedId, setExpandedId] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [buyingAgain, setBuyingAgain] = useState(null);

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Cannot cancel this order');
    } finally {
      setCancelling(null);
    }
  };

  const handleBuyAgain = async (orderId) => {
    setBuyingAgain(orderId);
    try {
      await orderService.buyAgain(orderId);
      await fetchCart();
      toast.success('Items added to cart!');
    } catch (err) {
      toast.error(err.message || 'Failed to add items to cart');
    } finally {
      setBuyingAgain(null);
    }
  };

  if (loading) return <Loader fullPage text="Loading orders..." />;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.order_id;
            const hoursSince = (Date.now() - new Date(order.created_at).getTime()) / 3600000;
            const canCancel = order.can_cancel && hoursSince <= 48 && order.order_status !== 'cancelled';

            return (
              <div key={order.order_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-5 flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order #{order.order_id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}
                    </p>
                    <p className="font-bold text-gray-900 text-base mt-0.5">
                      {formatCurrency(order.grand_total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge capitalize ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.order_status}
                    </span>
                    {order.estimated_delivery_date && order.order_status !== 'cancelled' && (
                      <span className="text-xs text-gray-500">{formatDeliveryDate(order.estimated_delivery_date)}</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(isExpanded ? null : order.order_id)}
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={buyingAgain === order.order_id}
                      onClick={() => handleBuyAgain(order.order_id)}
                    >
                      Buy Again
                    </Button>
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={cancelling === order.order_id}
                        onClick={() => handleCancel(order.order_id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Items */}
                {isExpanded && order.items && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.order_item_id} className="flex items-center gap-3">
                          <img
                            src={item.cover_image_url || `https://picsum.photos/seed/${item.book_id}/50/75`}
                            alt={item.title}
                            className="w-10 h-14 object-cover rounded"
                            onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/50/75`; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.author_name} · {item.format}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold shrink-0">{formatCurrency(item.total_price)}</p>
                        </div>
                      ))}
                    </div>
                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-1">
                      <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                      <Row label="Tax" value={formatCurrency(order.tax_amount)} />
                      {parseFloat(order.discount_amount) > 0 && (
                        <Row label="Discount" value={`-${formatCurrency(order.discount_amount)}`} />
                      )}
                      <Row label="Delivery" value={parseFloat(order.delivery_charges) === 0 ? 'FREE' : formatCurrency(order.delivery_charges)} />
                      <div className="flex justify-between font-bold pt-1 border-t">
                        <span>Grand Total</span>
                        <span className="text-blue-800">{formatCurrency(order.grand_total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-gray-600">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default OrderHistoryPage;
