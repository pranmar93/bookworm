import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import orderService from '../services/orderService';
import OrderConfirmation from '../components/checkout/OrderConfirmation';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loader fullPage text="Loading order confirmation..." />;

  return <OrderConfirmation order={order} />;
};

export default OrderConfirmationPage;
