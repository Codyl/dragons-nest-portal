import type { ReactNode } from 'react';

import { Field, FieldError, FieldLabel } from '../ui/field';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

type CheckboxFieldBase = {
  id: string;
  label: ReactNode;
  className?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  disabled?: boolean;
  'data-testid'?: string;
};

type CheckboxFieldWithForm = CheckboxFieldBase & {
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  checked?: never;
  onCheckedChange?: never;
  onBlur?: never;
};

type CheckboxFieldControlled = CheckboxFieldBase & {
  field?: undefined;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;
};

export type CheckboxFieldProps =
  | CheckboxFieldWithForm
  | CheckboxFieldControlled;

function CheckboxField(props: CheckboxFieldProps) {
  const {
    id,
    label,
    className,
    labelClassName,
    checkboxClassName,
    disabled = false,
    'data-testid': dataTestIdProp,
  } = props;

  const isFormField = 'field' in props && props.field != null;
  const field = isFormField ? props.field : null;

  const checked = isFormField ? !!field!.state.value : props.checked;

  const handleCheckedChange = (next: boolean) => {
    if (isFormField) {
      field!.handleChange(next);
    } else {
      (props as CheckboxFieldControlled).onCheckedChange(next);
    }
  };

  const handleBlur = () => {
    if (isFormField) {
      field!.handleBlur();
    } else {
      (props as CheckboxFieldControlled).onBlur?.();
    }
  };

  const isInvalid =
    isFormField && !field!.state.meta.isValid && field!.state.meta.isTouched;

  const labelTestId = isFormField ? `label-${field!.name}` : `label-${id}`;
  const checkboxTestId =
    dataTestIdProp ??
    (isFormField ? `checkbox-${field!.name}` : `checkbox-${id}`);

  return (
    <Field data-invalid={isInvalid || undefined} className={className}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          onBlur={handleBlur}
          disabled={disabled}
          data-testid={checkboxTestId}
          className={checkboxClassName}
          aria-invalid={isInvalid || undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCheckedChange(!checked);
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
        <FieldLabel
          htmlFor={id}
          data-testid={labelTestId}
          className={cn('text-sm leading-snug font-normal', labelClassName)}
        >
          {label}
        </FieldLabel>
      </div>
      {isFormField && isInvalid && (
        <FieldError
          data-testid={`error-message-${field!.name}`}
          errors={field!.state.meta.errors.map((e: unknown) =>
            typeof e === 'string' ? { message: e } : e,
          )}
        />
      )}
    </Field>
  );
}

export default CheckboxField;
