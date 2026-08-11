import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { isValidEmail } from '../utils/validation';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [giftPoints, setGiftPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, pointsRes] = await Promise.all([
          userService.getProfile(),
          userService.getGiftPoints(),
        ]);
        const profile = profileRes.data;
        setForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone_number: profile.phone_number || '',
        });
        setGiftPoints(pointsRes.data.gift_points || 0);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage text="Loading profile..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Gift Points */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-5 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-80">Available Gift Points</p>
            <p className="text-4xl font-bold">{giftPoints}</p>
            <p className="text-sm opacity-75 mt-1">Worth ₹{giftPoints} (redeem at checkout)</p>
          </div>
          <span className="text-5xl opacity-50">🎁</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={handleChange('first_name')}
              error={errors.first_name}
              required
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={handleChange('last_name')}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={form.phone_number}
            onChange={handleChange('phone_number')}
            placeholder="9876543210"
          />
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
