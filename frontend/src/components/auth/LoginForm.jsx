import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPassword } from '../../utils/validation';

const LoginForm = () => {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!isValidPassword(form.password)) errs.password = 'Password must be at least 6 characters';
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
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      toast.success('Browsing as guest');
      navigate('/');
    } catch (err) {
      toast.error('Guest login failed');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
        label="Password"
        type="password"
        value={form.password}
        onChange={handleChange('password')}
        error={errors.password}
        placeholder="Enter your password"
        required
        autoComplete="current-password"
      />
      <Button type="submit" fullWidth loading={loading}>
        Sign In
      </Button>

      <div className="relative flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 shrink-0">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <Button
        variant="outline"
        fullWidth
        onClick={handleGuestLogin}
        loading={guestLoading}
        type="button"
      >
        Continue as Guest
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-800 font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
