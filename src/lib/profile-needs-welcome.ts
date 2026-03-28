/** True when GET /profile has not yet recorded first in-app login (welcome not completed). */
export function profileNeedsWelcome(data: {
  first_logged_in_at?: string | null;
}): boolean {
  const v = data.first_logged_in_at;
  return v == null || v === '';
}
