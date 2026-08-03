// ─── Date & Time ───────────────────────────────────────────────
export const formatDate = (date, locale = 'en-IN') => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
};

export const formatDateTime = (date, locale = 'en-IN') => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const rtf  = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs  = Math.abs(diff);
  if (abs < 60_000)       return rtf.format(-Math.round(diff / 1000),        'second');
  if (abs < 3_600_000)    return rtf.format(-Math.round(diff / 60_000),      'minute');
  if (abs < 86_400_000)   return rtf.format(-Math.round(diff / 3_600_000),   'hour');
  if (abs < 2_592_000_000) return rtf.format(-Math.round(diff / 86_400_000), 'day');
  return formatDate(date);
};

// ─── Currency & Numbers ────────────────────────────────────────
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
};

export const formatNumber = (num, locale = 'en-IN') => {
  if (num == null) return '—';
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPercent = (value, decimals = 1) => {
  if (value == null) return '—';
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatCompact = (num) => {
  if (num == null) return '—';
  return new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

// ─── Strings ───────────────────────────────────────────────────
export const truncate = (str, maxLen = 40) => {
  if (!str || str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}…`;
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const titleCase = (str) =>
  str ? str.replace(/\w\S*/g, (w) => capitalize(w)) : '';

export const slugify = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

// ─── File Size ─────────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

// ─── Status helpers ────────────────────────────────────────────
export const getStatusVariant = (status) => {
  const map = {
    active:    'success',
    inactive:  'danger',
    pending:   'warning',
    completed: 'success',
    cancelled: 'danger',
    draft:     'info',
    approved:  'success',
    rejected:  'danger',
    received:  'primary',
    low:       'warning',
    out:       'danger',
    in_stock:  'success',
  };
  return map[String(status).toLowerCase()] ?? 'info';
};
