import React from 'react';
import PropTypes from 'prop-types';
import BookCard from './BookCard';

/** Skeleton placeholder for a book card */
const BookCardSkeleton = () => (
  <div className="card">
    <div className="skeleton aspect-[2/3] w-full" />
    <div className="p-3 space-y-2">
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-3 w-3/6" />
      <div className="skeleton h-4 w-2/6" />
    </div>
  </div>
);

const BookGrid = ({ books = [], loading = false, columns = 4, emptyMessage = 'No books found.' }) => {
  const gridCols = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4`}>
        {Array.from({ length: columns * 2 }).map((_, i) => <BookCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!loading && books.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4`}>
      {books.map((book) => (
        <BookCard key={book.book_id} book={book} />
      ))}
    </div>
  );
};

BookGrid.propTypes = {
  books: PropTypes.array,
  loading: PropTypes.bool,
  columns: PropTypes.number,
  emptyMessage: PropTypes.string,
};

export { BookCardSkeleton };
export default BookGrid;
