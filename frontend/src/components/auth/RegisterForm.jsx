import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPassword } from '../../utils/validation';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '', phone_number: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!isValidPassword(form.password)) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { confirm_password, ...data } = form;
      await register(data);
      toast.success('Account created! Welcome to BookWorm 📚');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={form.first_name}
          onChange={handleChange('first_name')}
          error={errors.first_name}
          placeholder="Jane"
          required
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          value={form.last_name}
          onChange={handleChange('last_name')}
          error={errors.last_name}
          placeholder="Doe"
          required
          autoComplete="family-name"
        />
      </div>
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        error={errors.email}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />
      <Input
        label="Phone Number"
        type="tel"
        value={form.phone_number}
        onChange={handleChange('phone_number')}
        placeholder="9876543210 (optional)"
        autoComplete="tel"
      />
      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={handleChange('password')}
        error={errors.password}
        placeholder="At least 6 characters"
        required
        autoComplete="new-password"
      />
      <Input
        label="Confirm Password"
        type="password"
        value={form.confirm_password}
        onChange={handleChange('confirm_password')}
        error={errors.confirm_password}
        placeholder="Repeat your password"
        required
        autoComplete="new-password"
      />
      <Button type="submit" fullWidth loading={loading}>
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-800 font-semibold hover:underline">Sign in</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
