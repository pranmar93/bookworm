import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

/**
 * Hook for fetching order history
 */
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getOrderHistory(params);
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, pagination, refetch: fetchOrders };
};
