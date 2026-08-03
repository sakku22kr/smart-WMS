/**
 * Generate a unique SKU from a product name.
 * Format: First 3 uppercase letters of name + 4 random alphanumeric chars
 * e.g. "Wireless Headset Pro" → "WHP-XK7R"
 */
export const generateSku = (name) => {
  if (!name || name.trim().length === 0) return '';

  const clean = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);

  // Take first letter of first 3 words, or first 3 letters of first word
  let prefix = '';
  if (words.length >= 3) {
    prefix = words[0][0] + words[1][0] + words[2][0];
  } else if (words.length >= 2) {
    prefix = (words[0].substring(0, 2) + words[1][0]).substring(0, 3);
  } else {
    prefix = words[0].substring(0, 3);
  }

  // Generate 4 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}-${suffix}`;
};

/**
 * Generate a barcode number (EAN-13 style, 12 digits + check digit).
 * For internal use — not a real UPC.
 */
export const generateBarcodeNumber = () => {
  let digits = '';
  for (let i = 0; i < 12; i++) {
    digits += Math.floor(Math.random() * 10);
  }

  // Calculate check digit (EAN-13 algorithm)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return digits + checkDigit;
};
