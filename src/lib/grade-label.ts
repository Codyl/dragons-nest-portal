/** Maps stored grade index (0–13) to display label for household students. */
export function gradeLabel(grade: number): string {
  if (grade === 0) return 'Kindergarten';

  if (grade >= 1 && grade <= 12)
    return `${grade}${grade === 1 ? 'st' : grade === 2 ? 'nd' : grade === 3 ? 'rd' : 'th'} Grade`;

  if (grade === 13) return 'Post-Secondary';

  return String(grade);
}

export const GRADE_OPTIONS: { value: number; label: string }[] = Array.from(
  { length: 14 },
  (_, i) => ({
    value: i,
    label: gradeLabel(i),
  }),
);
