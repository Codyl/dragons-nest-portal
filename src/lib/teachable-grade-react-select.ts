import { HOMESCHOOL_GRADE_OPTIONS } from '@/lib/homeschool-options';
import { ANY_GRADE_VALUE } from '@/lib/teachable-course-validation';
import type { StylesConfig, ThemeConfig } from 'react-select';

export type TeachableGradeOption = { value: string; label: string };

/** Enrichment subjects: “Any grade” sentinel plus catalog grades (matches course row UX). */
export const TEACHABLE_GRADE_OPTIONS_WITH_ANY: TeachableGradeOption[] = [
  ...HOMESCHOOL_GRADE_OPTIONS,
  { value: ANY_GRADE_VALUE, label: 'Any' },
];

export const teachableGradeSelectTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 6,
  colors: {
    ...theme.colors,
    primary: '#8b7355',
    primary25: '#ebe4d9',
    primary50: '#e7ddd0',
    neutral20: '#e7e5e4',
    neutral30: '#d6d3d1',
  },
});

export const teachableGradeSelectStyles: StylesConfig<
  TeachableGradeOption,
  true
> = {
  control: (base, state) => ({
    ...base,
    minHeight: 36,
    backgroundColor: '#f5f1eb',
    borderColor: state.isFocused ? '#a89878' : '#e7e5e4',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(139, 115, 85, 0.2)' : 'none',
    '&:hover': { borderColor: '#a89878' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#faf8f5',
    border: '1px solid #e7e5e4',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
  }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#8b7355'
      : state.isFocused
        ? '#ebe4d9'
        : 'transparent',
    color: state.isSelected ? '#fff' : '#1c1917',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#e7ddd0',
    borderRadius: 4,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#44403c',
    fontSize: '0.875rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#57534e',
    ':hover': { backgroundColor: '#d6d3d1', color: '#1c1917' },
  }),
  placeholder: (base) => ({ ...base, color: '#78716c', fontSize: '0.875rem' }),
  input: (base) => ({ ...base, fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, fontSize: '0.875rem' }),
};
