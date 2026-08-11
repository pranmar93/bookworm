/**
 * Format a number as Indian Rupee currency
 * @param {number} amount
 * @returns {string} e.g. "₹299.00"
 */
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return `₹${Number(amount).toFixed(2)}`;
};

/**
 * Format price compactly (no trailing zeros for whole numbers)
 */
export const formatPrice = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  const n = Number(amount);
  return n % 1 === 0 ? `₹${n}` : `₹${n.toFixed(2)}`;
};
