/**
 * Age from birth month/year using the last day of that month (youngest plausible
 * birthday in the month) so we bias toward requiring the under-13 path when uncertain.
 */
export function ageFromBirthMonthYear(
  month1to12: number,
  year: number,
): number {
  if (
    !Number.isFinite(month1to12) ||
    !Number.isFinite(year) ||
    month1to12 < 1 ||
    month1to12 > 12
  ) {
    return NaN;
  }
  const today = new Date();
  const jsMonth = month1to12 - 1;
  const lastDay = new Date(year, jsMonth + 1, 0).getDate();
  const birth = new Date(year, jsMonth, lastDay);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function isUnder13(month1to12: number, year: number): boolean {
  const age = ageFromBirthMonthYear(month1to12, year);
  return Number.isFinite(age) && age < 13;
}

/** True when computed age is under 18 (signup may skip role selection for manageduser path). */
export function isUnder18(month1to12: number, year: number): boolean {
  const age = ageFromBirthMonthYear(month1to12, year);
  return Number.isFinite(age) && age < 18;
}
