import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  const fetchWishlist = async () => {
    try {
      const res = await userService.getWishlist();
      setWishlist(res.data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (bookId) => {
    setRemoving((prev) => ({ ...prev, [bookId]: true }));
    try {
      await userService.removeFromWishlist(bookId);
      setWishlist((prev) => prev.filter((w) => w.book_id !== bookId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoving((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  const handleAddToCart = async (bookId, title) => {
    setAddingToCart((prev) => ({ ...prev, [bookId]: true }));
    try {
      await addToCart(bookId, 1);
      toast.success(`"${title}" added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  if (loading) return <Loader fullPage text="Loading wishlist..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">❤️</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save books you love and revisit them later.</p>
          <Link to="/catalog"><Button>Browse Books</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.wishlist_id} className="card flex gap-4 p-4">
              <Link to={`/books/${item.book_id}`}>
                <img
                  src={item.cover_image_url || `https://picsum.photos/seed/${item.book_id}/80/120`}
                  alt={item.title}
                  className="w-14 h-20 object-cover rounded-lg"
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.title}/80/120`; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.book_id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-800 line-clamp-2">
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.author_name}</p>
                <p className="text-blue-800 font-bold mt-1">{formatPrice(item.price)}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item.book_id, item.title)}
                    loading={addingToCart[item.book_id]}
                    className="text-xs"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(item.book_id)}
                    loading={removing[item.book_id]}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
