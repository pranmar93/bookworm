import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const BookDetailsPage = lazy(() => import('./pages/BookDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/** Protected route wrapper */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<Loader fullPage />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/books/:bookId" element={<BookDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
