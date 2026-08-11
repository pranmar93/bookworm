/**
 * Validate email format
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validate password strength (min 6 chars)
 */
export const isValidPassword = (password) => password && password.length >= 6;

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

/**
 * Validate PIN code (6 digits)
 */
export const isValidPinCode = (pin) => /^\d{6}$/.test(pin);

/**
 * Validate card number (16 digits, no spaces)
 */
export const isValidCardNumber = (num) => /^\d{16}$/.test(num.replace(/\s/g, ''));

/**
 * Validate CVV (3-4 digits)
 */
export const isValidCVV = (cvv) => /^\d{3,4}$/.test(cvv);

/**
 * Validate expiry date (MM/YY format, not expired)
 */
export const isValidExpiry = (expiry) => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1]);
  const year = 2000 + parseInt(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return new Date(year, month - 1) >= new Date(now.getFullYear(), now.getMonth());
};

/**
 * Validate address form fields
 */
export const validateAddress = (data) => {
  const errors = {};
  if (!data.first_name?.trim()) errors.first_name = 'First name is required';
  if (!data.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!data.address_line?.trim()) errors.address_line = 'Address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.state?.trim()) errors.state = 'State is required';
  if (!isValidPinCode(data.pin_code)) errors.pin_code = 'Enter valid 6-digit PIN code';
  if (!data.country?.trim()) errors.country = 'Country is required';
  return errors;
};
