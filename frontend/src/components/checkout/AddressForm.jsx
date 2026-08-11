import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';
import userService from '../../services/userService';
import { validateAddress } from '../../utils/validation';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const EMPTY_ADDRESS = {
  first_name: '', last_name: '', address_line: '', city: '',
  state: '', pin_code: '', country: 'India', phone_number: '', is_default: false,
};

const AddressForm = ({ onAddressSelect, selectedAddressId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await userService.getAddresses();
      setAddresses(res.data);
      // Auto-select default address
      if (!selectedAddressId) {
        const def = res.data.find((a) => a.is_default) || res.data[0];
        if (def) onAddressSelect(def.address_id);
      }
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateAddress(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await userService.createAddress(form);
      toast.success('Address saved');
      setAddresses((prev) => [...prev, res.data]);
      onAddressSelect(res.data.address_id);
      setShowForm(false);
      setForm(EMPTY_ADDRESS);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader size="sm" text="Loading addresses..." />;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800">Delivery Address</h3>

      {/* Existing Addresses */}
      {addresses.map((addr) => (
        <label
          key={addr.address_id}
          className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            selectedAddressId === addr.address_id
              ? 'border-blue-800 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="address"
            value={addr.address_id}
            checked={selectedAddressId === addr.address_id}
            onChange={() => onAddressSelect(addr.address_id)}
            className="mt-1 accent-blue-800"
            aria-label={`Select address: ${addr.address_line}, ${addr.city}`}
          />
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900">{addr.first_name} {addr.last_name}</p>
            <p>{addr.address_line}</p>
            <p>{addr.city}, {addr.state} – {addr.pin_code}</p>
            <p>{addr.country}</p>
            {addr.phone_number && <p className="text-gray-500">{addr.phone_number}</p>}
            {addr.is_default && <span className="badge bg-blue-100 text-blue-800 mt-1">Default</span>}
          </div>
        </label>
      ))}

      {/* Add New Address */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-blue-800 font-medium text-sm hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Address
        </button>
      ) : (
        <form onSubmit={handleSave} className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-gray-800">New Address</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={handleChange('first_name')} error={errors.first_name} required />
            <Input label="Last Name" value={form.last_name} onChange={handleChange('last_name')} error={errors.last_name} required />
          </div>
          <Input label="Address Line" value={form.address_line} onChange={handleChange('address_line')} error={errors.address_line} placeholder="Street, area, landmark" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={handleChange('city')} error={errors.city} required />
            <Input label="State" value={form.state} onChange={handleChange('state')} error={errors.state} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="PIN Code" value={form.pin_code} onChange={handleChange('pin_code')} error={errors.pin_code} placeholder="400001" required />
            <Input label="Country" value={form.country} onChange={handleChange('country')} error={errors.country} required />
          </div>
          <Input label="Phone Number" type="tel" value={form.phone_number} onChange={handleChange('phone_number')} placeholder="9876543210" />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={handleChange('is_default')} className="accent-blue-800" />
            Set as default address
          </label>
          <div className="flex gap-3">
            <Button type="submit" loading={saving} size="sm">Save Address</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} size="sm" type="button">Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
};

AddressForm.propTypes = {
  onAddressSelect: PropTypes.func.isRequired,
  selectedAddressId: PropTypes.string,
};

export default AddressForm;
