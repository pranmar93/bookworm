import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e3a5f', color: '#fff', borderRadius: '10px' },
              success: { style: { background: '#065f46', color: '#fff' } },
              error: { style: { background: '#991b1b', color: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
