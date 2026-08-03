/**
 * JWT utility helpers — decode token payload without verification
 * (verification is always done server-side via Spring Security).
 *
 * Used client-side only to:
 *  1. Check if an access token is expired BEFORE sending a request (skip unnecessary calls)
 *  2. Extract expiry time for UI countdown / session display
 */

/**
 * Decode a JWT's payload without signature verification.
 * Returns null if the token is malformed.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json   = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Returns the UTC expiry Date of the token, or null if it cannot be decoded.
 */
export const getTokenExpiry = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return null;
  return new Date(payload.exp * 1000);
};

/**
 * Returns true if the token is expired or will expire within the grace period.
 * @param {string}  token       JWT string
 * @param {number}  graceMs     Buffer in ms before expiry to consider "expired" (default 30s)
 */
export const isTokenExpired = (token, graceMs = 30_000) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true; // treat undecodable as expired
  return Date.now() >= expiry.getTime() - graceMs;
};

/**
 * Seconds remaining until token expiry (0 if already expired).
 */
export const getTokenRemainingSeconds = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;
  return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
};
