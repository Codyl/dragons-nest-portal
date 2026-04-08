import { Field, FieldError, FieldLabel } from '../ui/field';
import { cn } from '@/lib/utils';

export type SelectFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const defaultSelectClassName =
  'border-foreground bg-input h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

type SelectFieldSharedProps = {
  label: string;
  id: string;
  /** HTML `name` when not using a TanStack Form field (defaults to `id`) */
  name?: string;
  options: SelectFieldOption[];
  /** Placeholder option label; pass `null` to omit the empty option */
  placeholder?: string | null;
  placeholderValue?: string;
  selectClassName?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
};

type SelectFieldWithForm = SelectFieldSharedProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  value?: never;
  onValueChange?: never;
  onBlur?: never;
};

type SelectFieldControlled = SelectFieldSharedProps & {
  field?: undefined;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
};

export type SelectFieldProps = SelectFieldWithForm | SelectFieldControlled;

function SelectField(props: SelectFieldProps) {
  const {
    label,
    id,
    name: nameProp,
    options,
    placeholder = 'Select',
    placeholderValue = '',
    selectClassName,
    className,
    labelClassName,
    required = false,
    disabled = false,
    'data-testid': dataTestIdProp,
  } = props;

  const isFormField = 'field' in props && props.field != null;
  const field = isFormField ? props.field : null;

  const value = isFormField
    ? String(field!.state.value ?? '')
    : props.value;

  const handleValueChange = (v: string) => {
    if (isFormField) {
      field!.handleChange(v);
    } else {
      (props as SelectFieldControlled).onValueChange(v);
    }
  };

  const handleBlur = () => {
    if (isFormField) {
      field!.handleBlur();
    } else {
      (props as SelectFieldControlled).onBlur?.();
    }
  };

  const isInvalid =
    isFormField &&
    !field!.state.meta.isValid &&
    field!.state.meta.isTouched;

  const selectName = isFormField ? field!.name : (nameProp ?? id);

  const labelTestId = isFormField ? `label-${field!.name}` : `label-${id}`;
  const selectTestId =
    dataTestIdProp ?? (isFormField ? `select-${field!.name}` : `select-${id}`);

  return (
    <Field
      data-invalid={isInvalid || undefined}
      className={className}
    >
      <FieldLabel
        htmlFor={id}
        data-testid={labelTestId}
        className={labelClassName}
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <select
        id={id}
        name={selectName}
        data-testid={selectTestId}
        className={cn(defaultSelectClassName, selectClassName)}
        value={value}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        onBlur={handleBlur}
        onChange={(e) => handleValueChange(e.target.value)}
      >
        {placeholder !== null && (
          <option value={placeholderValue}>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
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

export default SelectField;
