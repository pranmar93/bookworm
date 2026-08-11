/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} date
 * @returns {string} e.g. "15 Jan 2024"
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a delivery date with "Delivered by" prefix
 */
export const formatDeliveryDate = (date) => {
  if (!date) return 'Delivery date TBD';
  return `Delivered by ${formatDate(date)}`;
};

/**
 * Get relative time string
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};
