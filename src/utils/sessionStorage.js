/**
 * Session storage utility — supports "Remember Me" by toggling between
 * localStorage (persistent) and sessionStorage (tab-scoped).
 *
 * Usage:
 *   sessionStorage.setRememberMe(true)  → tokens survive browser restart
 *   sessionStorage.setRememberMe(false) → tokens cleared when tab closes
 */

const KEYS = {
  ACCESS_TOKEN:   'swms_access_token',
  REFRESH_TOKEN:  'swms_refresh_token',
  AUTH_USER:      'swms_auth_user',
  REMEMBER_ME:    'swms_remember_me',
  SESSION_EXPIRY: 'swms_session_expiry',
  LAST_ACTIVITY:  'swms_last_activity',
};

// How long before an idle session auto-expires (default: 8 hours)
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

// ── Internal: pick storage based on rememberMe flag ──────────
const getStore = () => {
  const rememberMe = localStorage.getItem(KEYS.REMEMBER_ME) === 'true';
  return rememberMe ? localStorage : sessionStorage;
};

// ── Token operations ──────────────────────────────────────────
export const storage = {
  // Access token
  getAccessToken:  ()      => getStore().getItem(KEYS.ACCESS_TOKEN),
  setAccessToken:  (token) => getStore().setItem(KEYS.ACCESS_TOKEN, token),

  // Refresh token
  getRefreshToken: ()      => getStore().getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => getStore().setItem(KEYS.REFRESH_TOKEN, token),

  // Combined setter
  setTokens: (accessToken, refreshToken) => {
    const store = getStore();
    store.setItem(KEYS.ACCESS_TOKEN,  accessToken);
    store.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    storage.updateLastActivity();
  },

  // User profile
  getUser: () => {
    try {
      return JSON.parse(getStore().getItem(KEYS.AUTH_USER) || 'null');
    } catch {
      return null;
    }
  },
  setUser: (user) => getStore().setItem(KEYS.AUTH_USER, JSON.stringify(user)),

  // Remember Me flag — always in localStorage so it survives sessions
  isRememberMe:   ()        => localStorage.getItem(KEYS.REMEMBER_ME) === 'true',
  setRememberMe:  (value)   => localStorage.setItem(KEYS.REMEMBER_ME, String(value)),

  // Activity tracking — for idle-timeout auto-logout
  updateLastActivity: () =>
    localStorage.setItem(KEYS.LAST_ACTIVITY, String(Date.now())),

  getLastActivity: () =>
    parseInt(localStorage.getItem(KEYS.LAST_ACTIVITY) || '0', 10),

  isSessionIdle: () => {
    const last = storage.getLastActivity();
    if (!last) return false;
    return Date.now() - last > IDLE_TIMEOUT_MS;
  },

  // Full clear — both stores to cover both rememberMe states
  clearTokens: () => {
    [localStorage, sessionStorage].forEach(store => {
      store.removeItem(KEYS.ACCESS_TOKEN);
      store.removeItem(KEYS.REFRESH_TOKEN);
      store.removeItem(KEYS.AUTH_USER);
      store.removeItem(KEYS.SESSION_EXPIRY);
    });
    localStorage.removeItem(KEYS.LAST_ACTIVITY);
    // Note: REMEMBER_ME is intentionally kept so the preference persists
  },

  // Checks if any valid session data exists
  hasSession: () => {
    return !!(
      storage.getAccessToken() ||
      getStore().getItem(KEYS.ACCESS_TOKEN)
    );
  },
};

export { KEYS, IDLE_TIMEOUT_MS };
export default storage;
