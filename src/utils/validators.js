// ─── Email ──────────────────────────────────────────────────
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

// ─── Password ───────────────────────────────────────────────
export const isStrongPassword = (pwd) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

export const passwordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: 'None', color: 'surface' };
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (pwd.length >= 12)             score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  const levels = [
    { label: 'Very Weak', color: 'danger'  },
    { label: 'Weak',      color: 'danger'  },
    { label: 'Fair',      color: 'warning' },
    { label: 'Good',      color: 'info'    },
    { label: 'Strong',    color: 'success' },
    { label: 'Very Strong', color: 'success' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
};

// ─── Phone ──────────────────────────────────────────────────
export const isValidPhone = (phone) =>
  /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);

// ─── Numbers ────────────────────────────────────────────────
export const isPositiveNumber = (val) => !isNaN(val) && Number(val) > 0;
export const isNonNegative    = (val) => !isNaN(val) && Number(val) >= 0;
export const isInteger        = (val) => Number.isInteger(Number(val));

// ─── Strings ────────────────────────────────────────────────
export const isNotEmpty   = (val) => typeof val === 'string' && val.trim().length > 0;
export const maxLength    = (val, max) => String(val ?? '').length <= max;
export const minLength    = (val, min) => String(val ?? '').length >= min;
export const isAlphanumeric = (val) => /^[a-zA-Z0-9]+$/.test(val);

// ─── SKU / Code ─────────────────────────────────────────────
export const isValidSKU = (sku) => /^[A-Z0-9_-]{3,20}$/.test(sku);

// ─── URL ────────────────────────────────────────────────────
export const isValidURL = (url) => {
  try { new URL(url); return true; }
  catch { return false; }
};

// ─── Date ───────────────────────────────────────────────────
export const isValidDate   = (d) => !isNaN(new Date(d).getTime());
export const isFutureDate  = (d) => new Date(d) > new Date();
export const isPastDate    = (d) => new Date(d) < new Date();

// ─── React Hook Form rule builders ──────────────────────────
export const rules = {
  required:   (msg = 'This field is required') => ({ required: msg }),
  email:      (msg = 'Invalid email address')  => ({ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: msg } }),
  minLen:     (n, msg) => ({ minLength: { value: n, message: msg ?? `Minimum ${n} characters` } }),
  maxLen:     (n, msg) => ({ maxLength: { value: n, message: msg ?? `Maximum ${n} characters` } }),
  positive:   (msg = 'Must be a positive number') => ({ validate: (v) => isPositiveNumber(v) || msg }),
  nonNeg:     (msg = 'Must be 0 or greater')      => ({ validate: (v) => isNonNegative(v)    || msg }),
  sku:        (msg = 'Invalid SKU format (A-Z, 0-9, -, _ only)') => ({ pattern: { value: /^[A-Z0-9_-]{3,20}$/, message: msg } }),
  phone:      (msg = 'Invalid phone number') => ({ pattern: { value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, message: msg } }),
};
