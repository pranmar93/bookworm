import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import AddressForm from '../components/checkout/AddressForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';
import Loader from '../components/common/Loader';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const STEPS = ['Cart Review', 'Address', 'Payment'];

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [giftPoints, setGiftPoints] = useState(0);
  const [maxGiftPoints, setMaxGiftPoints] = useState(0);
  const [processing, setProcessing] = useState(false);

  const items = cart.items || [];
  const summary = cart.summary || {};

  useEffect(() => {
    userService.getGiftPoints().then((r) => {
      setMaxGiftPoints(r.data.gift_points || 0);
    }).catch(() => {});
  }, []);

  if (!items.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <button onClick={() => navigate('/catalog')} className="btn-primary mt-4">Browse Books</button>
      </div>
    );
  }

  const effectiveDiscount = Math.min(giftPoints, summary.subtotal * 0.1);
  const effectiveTotal = Math.max(0,
    (summary.subtotal || 0) + (summary.tax_amount || 0) + (summary.delivery_charges || 0) - effectiveDiscount
  );

  const handlePay = async (method, cardLastFour) => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setProcessing(true);
    try {
      // Step 1: Create order
      const orderRes = await orderService.createOrder({
        address_id: selectedAddress,
        gift_points_to_redeem: giftPoints,
      });
      const order = orderRes.data;

      // Step 2: Initiate payment
      const payRes = await paymentService.initiate(order.order_id, method, cardLastFour);
      const paymentId = payRes.data.payment.payment_id;

      // Step 3: Confirm payment (mock success)
      await paymentService.confirm(paymentId);

      // Step 4: Clear cart and navigate to confirmation
      await clearCart();
      toast.success('Payment successful! 🎉');
      navigate(`/order-confirmation/${order.order_id}`);
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === step ? 'text-blue-800' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-20 h-0.5 mb-4 mx-1 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Review Cart */}
          {step === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Review Your Cart</h2>
              <ul className="space-y-3 mb-6">
                {items.map((item) => (
                  <li key={item.cart_item_id} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/50/75`; }}
                    />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-gray-500">{item.author_name} · Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setStep(1)}
                className="btn-primary w-full"
              >
                Proceed to Address →
              </button>
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <AddressForm
                onAddressSelect={setSelectedAddress}
                selectedAddressId={selectedAddress}
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                <button
                  onClick={() => {
                    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
                    setStep(2);
                  }}
                  className="btn-primary flex-1"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <PaymentForm
                amount={effectiveTotal}
                onPay={handlePay}
                loading={processing}
              />
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Change address
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={items}
            subtotal={summary.subtotal || 0}
            tax={summary.tax_amount || 0}
            delivery={summary.delivery_charges || 0}
            discount={effectiveDiscount}
            total={effectiveTotal}
            giftPoints={giftPoints}
            onPointsChange={setGiftPoints}
            maxPoints={maxGiftPoints}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
