/** True when GET /profile has not yet recorded first in-app login (welcome not completed). */
export function profileNeedsWelcome(data: {
  firstLoggedInAt?: string | null;
}): boolean {
  const v = data.firstLoggedInAt;
  return v == null || v === '';
}
