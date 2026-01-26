import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const InputField = ({
  field,
  label,
  className,
  type = "text",
  placeholder,
  normalize,
  format,
  required = false,
  ...props
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  className?: string;
  type?: string;
  placeholder?: string;
  normalize?: (value: string) => string;
  format?: (value: string) => string;
  required?: boolean;
} & React.ComponentProps<"input">) => {
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}{required && <span className="text-destructive">*</span>}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        normalize={normalize}
        format={format}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default InputField;
