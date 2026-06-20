import clsx from 'clsx';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const InputField = ({
  field,
  label,
  className,
  inputClassName,
  type = 'text',
  placeholder,
  normalize,
  format,
  required = false,
  ...props
}: {
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  className?: string;
  inputClassName?: string;
  type?: string;
  placeholder?: string;
  normalize?: (value: string) => string;
  format?: (value: string) => string;
  required?: boolean;
} & React.ComponentProps<'input'>) => {
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name} data-testid={`label-${field.name}`}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={field.name}
        data-testid={`input-${field.name}`}
        name={field.name}
        type={type}
        className={clsx(inputClassName, 'bg-white')}
        value={field.state.value}
        normalize={normalize}
        format={format}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(
            normalize ? normalize(e.target.value) : e.target.value,
          )
        }
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />
      {isInvalid && (
        <FieldError
          data-testid={`error-message-${field.name}`}
          errors={field.state.meta.errors.map((e: unknown) =>
            typeof e === 'string' ? { message: e } : e,
          )}
        />
      )}
    </Field>
  );
};

export default InputField;
