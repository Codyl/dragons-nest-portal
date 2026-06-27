// ponytail: lightweight synchronous auth flag (localStorage).
// Cookies are HttpOnly so JS can't read them; this mirrors their presence.
// Ceiling: a stale flag survives if cookies expire server-side without a 401 being triggered;
// upgrade path: add a periodic silent /profile probe or listen to a BroadcastChannel logout event.

const KEY = 'dn_authenticated';

export function markAuthenticated(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // private browsing or quota — non-critical
  }
}

export function clearAuthenticated(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // non-critical
  }
}

export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
