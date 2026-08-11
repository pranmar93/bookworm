import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-white">BookWorm</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Your one-stop destination for books of every genre. From timeless classics to new releases,
            discover your next favourite read with BookWorm.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/catalog" className="hover:text-white transition-colors">Browse Books</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-white mb-3">Categories</h3>
          <ul className="space-y-2 text-sm">
            {['Romance', 'Mystery', 'Science Fiction', 'Fantasy', 'Thriller', 'Biography'].map((cat) => (
              <li key={cat}>
                <Link
                  to={`/catalog?search=${encodeURIComponent(cat)}`}
                  className="hover:text-white transition-colors"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} BookWorm. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <span className="text-red-400">♥</span> for book lovers
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
