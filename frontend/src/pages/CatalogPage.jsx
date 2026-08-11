import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import bookService from '../services/bookService';
import BookGrid from '../components/catalog/BookGrid';
import CategorySidebar from '../components/catalog/CategorySidebar';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const sortVal = searchParams.get('sort') || '';
  const searchQ = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchQ) {
        res = await bookService.search(searchQ, { page: currentPage, limit: 20 });
        setBooks(res.data.books || []);
        setPagination(null);
      } else if (selectedCategory) {
        res = await bookService.getCategoryBooks(selectedCategory, { page: currentPage, limit: 20, sort: sortVal });
        setBooks(res.data.books || []);
        setPagination(res.data.pagination || null);
      } else {
        const params = { page: currentPage, limit: 20 };
        if (sortVal) params.sort = sortVal;
        res = await bookService.getBooks(params);
        setBooks(res.data.books || []);
        setPagination(res.data.pagination || null);
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortVal, searchQ, currentPage]);

  useEffect(() => {
    bookService.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const updateParam = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      next.set('page', '1');
      return next;
    });
  };

  const handleCategorySelect = (id) => updateParam({ category: id || undefined });
  const handleFilterChange = (updates) => updateParam(updates);

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.category_id === selectedCategory)?.category_name
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {searchQ ? `Search: "${searchQ}"` : selectedCategoryName || 'All Books'}
        </h1>
        {pagination && (
          <p className="text-sm text-gray-500 mt-1">{pagination.total} books found</p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium text-blue-800 border border-blue-800 rounded-lg px-3 py-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-expanded={sidebarOpen}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 10h18M3 16h18" />
          </svg>
          Filters
        </button>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-56 shrink-0`}>
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={handleCategorySelect}
            filters={{ sort: sortVal }}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Books Grid */}
        <div className="flex-1 min-w-0">
          <BookGrid
            books={books}
            loading={loading}
            columns={4}
            emptyMessage={searchQ ? `No books found for "${searchQ}"` : 'No books in this category yet.'}
          />

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <PaginationButton
                label="← Prev"
                disabled={currentPage === 1}
                onClick={() => updateParam({ page: String(currentPage - 1) })}
              />
              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of {pagination.total_pages}
              </span>
              <PaginationButton
                label="Next →"
                disabled={currentPage >= pagination.total_pages}
                onClick={() => updateParam({ page: String(currentPage + 1) })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PaginationButton = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    {label}
  </button>
);

export default CatalogPage;
