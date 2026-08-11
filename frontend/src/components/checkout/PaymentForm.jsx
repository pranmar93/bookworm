import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import Input from '../common/Input';
import Button from '../common/Button';
import {
  isValidCardNumber, isValidCVV, isValidExpiry,
} from '../../utils/validation';

const METHODS = [
  { id: 'credit_card', label: 'Credit Card', icon: '💳' },
  { id: 'debit_card', label: 'Debit Card', icon: '🏦' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
];

const PaymentForm = ({ amount, onPay, loading }) => {
  const [method, setMethod] = useState('credit_card');
  const [cardData, setCardData] = useState({ number: '', name: '', cvv: '', expiry: '' });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});

  const handleCardChange = (field) => (e) => {
    let val = e.target.value;
    if (field === 'number') val = val.replace(/\D/g, '').slice(0, 16);
    if (field === 'cvv') val = val.replace(/\D/g, '').slice(0, 4);
    if (field === 'expiry') {
      val = val.replace(/\D/g, '').slice(0, 4);
      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (method === 'credit_card' || method === 'debit_card') {
      if (!isValidCardNumber(cardData.number)) errs.number = 'Enter a valid 16-digit card number';
      if (!cardData.name.trim()) errs.name = 'Name on card is required';
      if (!isValidCVV(cardData.cvv)) errs.cvv = 'Enter valid CVV (3-4 digits)';
      if (!isValidExpiry(cardData.expiry)) errs.expiry = 'Enter valid expiry (MM/YY)';
    }
    if (method === 'upi' && !upiId.includes('@')) errs.upiId = 'Enter valid UPI ID (e.g., name@upi)';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const lastFour = (method === 'credit_card' || method === 'debit_card')
      ? cardData.number.slice(-4)
      : null;
    onPay(method, lastFour);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payable Amount */}
      <div className="bg-blue-900 text-white rounded-xl p-5 text-center">
        <p className="text-sm text-blue-200 mb-1">Total Payable</p>
        <p className="text-4xl font-bold">{formatCurrency(amount)}</p>
        <p className="text-xs text-blue-300 mt-1 flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secured with 256-bit encryption
        </p>
      </div>

      {/* Payment Method Tabs */}
      <div>
        <p className="font-semibold text-gray-800 mb-3">Choose Payment Method</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMethod(m.id); setErrors({}); }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                method === m.id
                  ? 'border-blue-800 bg-blue-50 text-blue-800'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Fields */}
      {(method === 'credit_card' || method === 'debit_card') && (
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <Input
            label="Card Number"
            value={cardData.number.replace(/(.{4})/g, '$1 ').trim()}
            onChange={handleCardChange('number')}
            error={errors.number}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            required
          />
          <Input
            label="Name on Card"
            value={cardData.name}
            onChange={handleCardChange('name')}
            error={errors.name}
            placeholder="JOHN DOE"
            autoComplete="cc-name"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiry Date"
              value={cardData.expiry}
              onChange={handleCardChange('expiry')}
              error={errors.expiry}
              placeholder="MM/YY"
              inputMode="numeric"
              required
            />
            <Input
              label="CVV"
              type="password"
              value={cardData.cvv}
              onChange={handleCardChange('cvv')}
              error={errors.cvv}
              placeholder="•••"
              inputMode="numeric"
              autoComplete="cc-csc"
              required
            />
          </div>
        </div>
      )}

      {/* UPI */}
      {method === 'upi' && (
        <div className="bg-gray-50 rounded-xl p-4">
          <Input
            label="UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            error={errors.upiId}
            placeholder="yourname@upi"
            required
          />
        </div>
      )}

      {/* Wallet */}
      {method === 'wallet' && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            Your wallet balance will be used to complete this payment.
          </p>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Pay {formatCurrency(amount)}
      </Button>
    </form>
  );
};

PaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  onPay: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default PaymentForm;
