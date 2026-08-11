import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../common/Button';

const OrderConfirmation = ({ order }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center px-8 pt-10 pb-6 border-b border-gray-700">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Your purchase is successful! 🎉</h2>
          <p className="text-gray-400 text-sm">
            Your purchase of the following reads is successful
          </p>
        </div>

        {/* Books */}
        <div className="px-6 py-4 space-y-3">
          {order.items?.map((item) => (
            <div key={item.order_item_id} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
              <img
                src={item.cover_image_url || `https://picsum.photos/seed/${item.book_id}/50/75`}
                alt={item.title}
                className="w-10 h-14 object-cover rounded"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/50/75`; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.author_name}</p>
                <p className="text-gray-400 text-xs">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
              </div>
              <p className="text-green-400 font-bold text-sm">{formatCurrency(item.total_price)}</p>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="px-6 pb-4 space-y-2 text-sm">
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <Row label="Order ID" value={`#${order.order_id?.slice(0, 8).toUpperCase()}`} />
            <Row label="Grand Total" value={formatCurrency(order.grand_total)} highlight />
            <Row label="Payment Status" value={
              <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-green-900 text-green-300">
                {order.payment_status}
              </span>
            } />
            {order.estimated_delivery_date && (
              <Row label="Estimated Delivery" value={formatDate(order.estimated_delivery_date)} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1">
            <Button variant="outline" fullWidth className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/orders" className="flex-1">
            <Button variant="success" fullWidth>
              View Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between text-gray-300">
    <span className="text-gray-400">{label}</span>
    <span className={`font-medium ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
  </div>
);

OrderConfirmation.propTypes = {
  order: PropTypes.object,
};

export default OrderConfirmation;
