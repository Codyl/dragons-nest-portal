import type { ExpectedBirthBand } from '@/lib/account-setup-flow';

/** Parse `YYYY-MM-DD` from a date input into a local calendar Date, or null if invalid. */
export function parseIsoDateOnlyLocal(iso: string): Date | null {
  const s = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;

  const [y, m, d] = s.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }

  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }

  return dt;
}

/** Whole-year age in local calendar (aligned with Nest `ageFromBirthDate`). */
export function ageFromLocalDateOfBirth(
  birth: Date,
  refDate: Date = new Date(),
): number {
  let years = refDate.getFullYear() - birth.getFullYear();
  const monthDiff = refDate.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && refDate.getDate() < birth.getDate())
  ) {
    years -= 1;
  }

  return years;
}

export function birthDateIsoMatchesExpectedBand(
  iso: string,
  band: ExpectedBirthBand,
): boolean {
  const parsed = parseIsoDateOnlyLocal(iso);
  if (!parsed) return false;

  const age = ageFromLocalDateOfBirth(parsed);
  if (!Number.isFinite(age)) return false;

  switch (band) {
    case 'adult':
      return age >= 18;
    case 'teen13to17':
      return age >= 13 && age <= 17;
    case 'under13':
      return age < 13;
    default:
      return false;
  }
}

export function birthBandValidationMessage(band: ExpectedBirthBand): string {
  switch (band) {
    case 'adult':
      return 'Date of birth must show you are 18 or older';
    case 'teen13to17':
      return 'Date of birth must be between ages 13 and 17';
    case 'under13':
      return 'Date of birth must show you are under 13';
    default:
      return 'Enter a valid date of birth';
  }
}
