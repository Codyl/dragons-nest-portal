import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const InputField = ({
  field,
  label,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  className?: string;
}) => {
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={field.state.meta.placeholder}
        autoComplete='off'
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default InputField;
