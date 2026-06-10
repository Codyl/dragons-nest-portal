import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const PasswordInputField = ({
  field,
  label,
  className,
  autoFocus,
  autoComplete = 'new-password',
}: {
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}) => {
  const [visible, setVisible] = useState(false);
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;

  return (
    <Field
      data-invalid={isInvalid}
      className={className}
    >
      <FieldLabel
        htmlFor={field.name}
        data-testid={`label-${field.name}`}
      >
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          id={field.name}
          data-testid={`input-${field.name}`}
          name={field.name}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10')}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label={visible ? 'Hide password' : 'Show password'}
          data-testid={`toggle-visibility-${field.name}`}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
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

export default PasswordInputField;
