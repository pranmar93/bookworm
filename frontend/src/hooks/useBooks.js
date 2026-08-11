import { useState, useEffect, useCallback } from 'react';
import bookService from '../services/bookService';

/**
 * Hook for fetching books with filters, search, and pagination
 */
export const useBooks = (initialParams = {}) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchBooks = useCallback(async (fetchParams = params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookService.getBooks(fetchParams);
      setBooks(res.data.books || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return { books, loading, error, pagination, params, updateParams, refetch: fetchBooks };
};
