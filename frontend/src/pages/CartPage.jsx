import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice, formatCurrency } from '../utils/formatCurrency';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, loading, updateItem, removeItem, itemCount } = useCart();
  const navigate = useNavigate();

  if (loading) return <Loader fullPage text="Loading cart..." />;

  const items = cart.items || [];
  const summary = cart.summary || {};

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added any books yet.</p>
        <Link to="/catalog">
          <Button size="lg">Browse Books</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.cart_item_id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 text-base mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(summary.subtotal)} />
              <Row label="Tax (18% GST)" value={formatCurrency(summary.tax_amount)} />
              <Row
                label="Delivery"
                value={summary.delivery_charges === 0 ? 'FREE' : formatCurrency(summary.delivery_charges)}
                green={summary.delivery_charges === 0}
              />
              {summary.delivery_charges === 0 && (
                <p className="text-xs text-green-600">🎉 Free delivery on orders over ₹500!</p>
              )}
              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-blue-800">{formatCurrency(summary.grand_total)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" className="mt-5" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Link to="/catalog" className="block text-center text-sm text-blue-800 mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onUpdate, onRemove }) => {
  const [removing, setRemoving] = React.useState(false);

  const handleQuantityChange = async (newQty) => {
    try {
      await onUpdate(item.cart_item_id, newQty);
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.cart_item_id);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
      <Link to={`/books/${item.book_id}`}>
        <img
          src={item.cover_image_url || `https://picsum.photos/seed/${item.book_id}/80/120`}
          alt={item.title}
          className="w-16 h-24 object-cover rounded-lg"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/80/120`; }}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/books/${item.book_id}`} className="font-semibold text-gray-900 hover:text-blue-800 line-clamp-2">
          {item.title}
        </Link>
        <p className="text-sm text-gray-500">{item.author_name}</p>
        <p className="text-xs text-gray-400">{item.format}</p>
        <p className="text-base font-bold text-blue-800 mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center gap-4 mt-2">
          {/* Quantity */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >−</button>
            <span className="px-3 py-1.5 border-x border-gray-300 font-semibold">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= 10}
              className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              aria-label="Increase quantity"
            >+</button>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            aria-label={`Remove ${item.title} from cart`}
          >
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-gray-900">
          {formatCurrency(parseFloat(item.price) * item.quantity)}
        </p>
      </div>
    </div>
  );
};

const Row = ({ label, value, green }) => (
  <div className="flex justify-between text-gray-600">
    <span>{label}</span>
    <span className={green ? 'text-green-600 font-semibold' : ''}>{value}</span>
  </div>
);

export default CartPage;
