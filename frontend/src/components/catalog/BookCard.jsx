import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    {count !== undefined && <span className="text-xs text-gray-500">({count})</span>}
  </div>
);

const BookCard = ({ book, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = React.useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(book.book_id, 1);
      toast.success(`"${book.title}" added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/books/${book.book_id}`}
      className="card group block hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      aria-label={`${book.title} by ${book.author_name}`}
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[2/3]">
        <img
          src={book.cover_image_url || `https://picsum.photos/seed/${book.book_id}/200/300`}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${book.title}/200/300`;
          }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {book.is_bestseller && (
            <span className="badge bg-amber-500 text-white text-xs">Bestseller</span>
          )}
          {book.is_new_launch && (
            <span className="badge bg-green-600 text-white text-xs">New</span>
          )}
        </div>
        {/* Format */}
        <div className="absolute bottom-2 right-2">
          <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{book.format}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-800 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{book.author_name}</p>

        {book.avg_rating > 0 && (
          <StarRating rating={parseFloat(book.avg_rating)} count={book.review_count} />
        )}

        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-base font-bold text-blue-800">{formatPrice(book.price)}</span>
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={adding || book.stock_quantity === 0}
              className="text-xs font-semibold bg-blue-800 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Add ${book.title} to cart`}
            >
              {adding ? '...' : book.stock_quantity === 0 ? 'Out of Stock' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    book_id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author_name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    cover_image_url: PropTypes.string,
    format: PropTypes.string,
    is_bestseller: PropTypes.bool,
    is_new_launch: PropTypes.bool,
    avg_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock_quantity: PropTypes.number,
  }).isRequired,
  showAddToCart: PropTypes.bool,
};

export { StarRating };
export default BookCard;
