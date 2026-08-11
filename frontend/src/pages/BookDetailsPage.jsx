import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookService from '../services/bookService';
import userService from '../services/userService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatCurrency';
import { formatDate, formatDeliveryDate } from '../utils/formatDate';
import BookGrid from '../components/catalog/BookGrid';
import { StarRating } from '../components/catalog/BookCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bookRes, relatedRes, reviewsRes] = await Promise.all([
          bookService.getBook(bookId),
          bookService.getRelated(bookId),
          bookService.getReviews(bookId),
        ]);
        setBook(bookRes.data);
        setRelated(relatedRes.data);
        setReviews(reviewsRes.data);
      } catch {
        toast.error('Book not found');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [bookId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); navigate('/login'); return; }
    setAddingCart(true);
    try {
      await addToCart(book.book_id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await userService.removeFromWishlist(book.book_id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await userService.addToWishlist(book.book_id);
        setWishlisted(true);
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) return <Loader fullPage text="Loading book..." />;
  if (!book) return null;

  const avgRating = parseFloat(book.avg_rating || 0);
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-800 transition-colors">Home</Link>
        <span>›</span>
        <Link to="/catalog" className="hover:text-blue-800 transition-colors">Books</Link>
        {book.category_name && (
          <>
            <span>›</span>
            <Link to={`/catalog?category=${book.category_id}`} className="hover:text-blue-800 transition-colors">{book.category_name}</Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-700 truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* Cover Image */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-2xl overflow-hidden shadow-xl bg-gray-100 aspect-[2/3]">
            <img
              src={book.cover_image_url || `https://picsum.photos/seed/${bookId}/400/600`}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${book.title}/400/600`; }}
            />
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {book.is_bestseller && <span className="badge bg-amber-500 text-white">⭐ Bestseller</span>}
            {book.is_new_launch && <span className="badge bg-green-600 text-white">🆕 New Launch</span>}
            {book.is_recommended && <span className="badge bg-blue-600 text-white">👍 Recommended</span>}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{book.title}</h1>

          <p className="text-lg text-gray-600">
            by{' '}
            <Link
              to={`/catalog?q=${encodeURIComponent(book.author_name || '')}`}
              className="text-blue-800 font-semibold hover:underline"
            >
              {book.author_name}
            </Link>
          </p>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} />
              <span className="text-sm text-gray-600">
                {avgRating.toFixed(1)} ({book.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price & Format */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-800">{formatPrice(book.price)}</span>
            <span className="badge bg-gray-100 text-gray-700 px-3 py-1">{book.format}</span>
          </div>

          {/* Delivery */}
          <p className="text-sm text-green-700 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {formatDeliveryDate(estimatedDelivery)} · {book.stock_quantity > 0 ? 'In stock' : 'Out of stock'}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700" htmlFor="quantity-selector">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Decrease quantity"
              >−</button>
              <span id="quantity-selector" className="px-4 py-2 font-semibold border-x border-gray-300 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAddToCart}
              loading={addingCart}
              disabled={book.stock_quantity === 0}
              size="lg"
              className="flex-1 sm:flex-none min-w-[180px]"
            >
              {book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleWishlist}
              loading={wishlistLoading}
              size="lg"
            >
              {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
            </Button>
          </div>

          {/* Description */}
          {book.description && (
            <div className="border-t pt-4">
              <h2 className="font-bold text-gray-800 mb-2">About this book</h2>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Author Info */}
          {book.author_bio && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-800 mb-2">About {book.author_name}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{book.author_bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Customer Reviews
          {reviews.length > 0 && <span className="text-gray-400 font-normal ml-2 text-base">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.review_id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{review.first_name} {review.last_name}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                </div>
                {review.review_text && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.review_text}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Books */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Reads</h2>
          <BookGrid books={related} columns={4} />
        </section>
      )}
    </div>
  );
};

export default BookDetailsPage;
