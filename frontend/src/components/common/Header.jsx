import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import SearchBar from '../catalog/SearchBar';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
            <span className="text-2xl" aria-hidden="true">📚</span>
            <span className="text-xl font-bold tracking-tight">BookWorm</span>
          </Link>

          {/* Search bar — hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink to="/orders" label="My Orders" />
            <NavLink to="/wishlist" label="My Wishlist" />
            <NavLink to="/catalog" label="All Books" />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-blue-800 rounded-lg transition-colors ml-1"
              aria-label={`Cart, ${itemCount} items`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 hover:bg-blue-800 rounded-lg p-2 transition-colors"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-semibold text-sm truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <DropdownLink to="/profile" icon="👤" label="Profile" onClick={() => setProfileOpen(false)} />
                    <DropdownLink to="/orders" icon="📦" label="My Orders" onClick={() => setProfileOpen(false)} />
                    <DropdownLink to="/wishlist" icon="❤️" label="My Wishlist" onClick={() => setProfileOpen(false)} />
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="text-sm font-medium hover:text-blue-200 px-3 py-2 transition-colors">Sign In</Link>
                <Link to="/register" className="bg-white text-blue-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">Sign Up</Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-blue-800 pt-3 space-y-1" aria-label="Mobile navigation">
            <MobileNavLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/catalog" label="All Books" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/cart" label={`Cart (${itemCount})`} onClick={() => setMobileOpen(false)} />
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/orders" label="My Orders" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/wishlist" label="My Wishlist" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/profile" label="Profile" onClick={() => setMobileOpen(false)} />
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-red-300 hover:bg-blue-800 rounded-lg text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/register" label="Sign Up" onClick={() => setMobileOpen(false)} />
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap"
  >
    {label}
  </Link>
);

const MobileNavLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-3 py-2 text-sm font-medium hover:bg-blue-800 rounded-lg transition-colors"
  >
    {label}
  </Link>
);

const DropdownLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
  >
    <span className="text-base">{icon}</span>
    {label}
  </Link>
);

export default Header;
