import React from 'react';
import PropTypes from 'prop-types';

const CATEGORIES = [
  { label: 'All Books', value: '' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Mystery', value: 'Mystery' },
  { label: 'Science Fiction', value: 'Science Fiction' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Biography', value: 'Biography' },
  { label: 'Self-Help', value: 'Self-Help' },
  { label: 'Business', value: 'Business' },
  { label: 'History', value: 'History' },
  { label: "Children's Books", value: "Children's Books" },
  { label: 'Non-fiction', value: 'Non-fiction' },
  { label: 'Horror', value: 'Horror' },
];

/**
 * Category sidebar that works with both category IDs (from API) and category names.
 * Accepts `categories` from API for dynamic IDs, or falls back to static list.
 */
const CategorySidebar = ({
  categories = [],
  selectedCategoryId = '',
  onSelectCategory,
  filters = {},
  onFilterChange,
}) => {
  // Merge API categories with static labels
  const displayCategories = categories.length > 0
    ? [{ category_id: '', category_name: 'All Books', book_count: null }, ...categories]
    : CATEGORIES.map((c) => ({ category_id: c.value, category_name: c.label, book_count: null }));

  return (
    <aside
      className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4"
      aria-label="Book categories filter"
    >
      <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-3">Categories</h2>
      <ul className="space-y-0.5">
        {displayCategories.map((cat) => {
          const id = cat.category_id;
          const isActive = selectedCategoryId === id;
          return (
            <li key={id}>
              <button
                onClick={() => onSelectCategory(id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                  ${isActive
                    ? 'bg-blue-800 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                aria-pressed={isActive}
              >
                <span>{cat.category_name}</span>
                {cat.book_count !== null && (
                  <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                    {cat.book_count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Sort & Filters */}
      {onFilterChange && (
        <>
          <div className="mt-5 border-t border-gray-100 pt-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-3">Sort By</h2>
            <select
              value={filters.sort || ''}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="w-full input-field text-sm py-2"
              aria-label="Sort books by"
            >
              <option value="">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="bestseller">Bestsellers</option>
            </select>
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-2">Filter</h2>
            {[
              { key: 'bestseller', label: 'Bestsellers' },
              { key: 'new_launch', label: 'New Launches' },
              { key: 'recommended', label: 'Recommended' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={filters[key] === 'true'}
                  onChange={(e) => onFilterChange({ [key]: e.target.checked ? 'true' : undefined })}
                  className="accent-blue-800 w-4 h-4 rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </>
      )}
    </aside>
  );
};

CategorySidebar.propTypes = {
  categories: PropTypes.array,
  selectedCategoryId: PropTypes.string,
  onSelectCategory: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default CategorySidebar;
