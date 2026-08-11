import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderSummary = ({
  items = [],
  subtotal = 0,
  tax = 0,
  delivery = 0,
  discount = 0,
  total = 0,
  giftPoints = 0,
  onPointsChange,
  maxPoints = 0,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
    <h3 className="font-bold text-gray-800 text-base border-b pb-3">Order Summary</h3>

    {/* Items */}
    <ul className="space-y-3 max-h-64 overflow-y-auto">
      {items.map((item) => (
        <li key={item.cart_item_id || item.order_item_id} className="flex gap-3">
          <img
            src={item.cover_image_url || `https://picsum.photos/seed/${item.book_id}/50/75`}
            alt={item.title}
            className="w-10 h-14 object-cover rounded"
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/50/75`; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</p>
            <p className="text-xs text-gray-500">{item.author_name}</p>
            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          </div>
          <p className="text-sm font-semibold text-gray-800 shrink-0">
            {formatCurrency(parseFloat(item.price || item.unit_price) * item.quantity)}
          </p>
        </li>
      ))}
    </ul>

    {/* Gift Points Redemption */}
    {onPointsChange && maxPoints > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-amber-800 mb-2">
          🎁 You have {maxPoints} gift points (₹{maxPoints})
        </p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={maxPoints}
            value={giftPoints}
            onChange={(e) => onPointsChange(parseInt(e.target.value))}
            className="flex-1 accent-amber-500"
            aria-label={`Redeem gift points, currently ${giftPoints}`}
          />
          <span className="text-xs font-bold text-amber-700 w-12 text-right">{giftPoints} pts</span>
        </div>
      </div>
    )}

    {/* Breakdown */}
    <div className="space-y-2 border-t pt-3 text-sm">
      <Row label="Subtotal" value={formatCurrency(subtotal)} />
      <Row label="Tax (18% GST)" value={formatCurrency(tax)} />
      <Row label="Delivery" value={delivery === 0 ? 'FREE' : formatCurrency(delivery)} highlight={delivery === 0} />
      {discount > 0 && (
        <Row label={`Gift Points (−${discount} pts)`} value={`−${formatCurrency(discount)}`} highlight />
      )}
      <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
        <span>Grand Total</span>
        <span className="text-blue-800">{formatCurrency(total)}</span>
      </div>
    </div>
  </div>
);

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between text-gray-600">
    <span>{label}</span>
    <span className={highlight ? 'text-green-600 font-semibold' : ''}>{value}</span>
  </div>
);

OrderSummary.propTypes = {
  items: PropTypes.array,
  subtotal: PropTypes.number,
  tax: PropTypes.number,
  delivery: PropTypes.number,
  discount: PropTypes.number,
  total: PropTypes.number,
  giftPoints: PropTypes.number,
  onPointsChange: PropTypes.func,
  maxPoints: PropTypes.number,
};

export default OrderSummary;
