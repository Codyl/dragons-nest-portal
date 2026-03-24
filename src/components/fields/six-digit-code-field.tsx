import { useRef, useCallback, useId } from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { cn } from "@/lib/utils";

const digitInputClassName = cn(
  "border-input dark:bg-input/30 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:text-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
);

const DIGIT_COUNT = 6;

const SixDigitCodeField = ({
  field,
  label,
  className,
  required = false,
  autoFocus,
  ...props
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label: string;
  className?: string;
  required?: boolean;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur" | "name">) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;
  const value = (field.state.value as string) || "";
  const digits = value.padEnd(DIGIT_COUNT, " ").split("").slice(0, DIGIT_COUNT);
  const id = useId();
  const hiddenInputId = `${id}-hidden`;

  const setValue = useCallback(
    (newValue: string) => {
      const digitsOnly = newValue.replace(/\D/g, "").slice(0, DIGIT_COUNT);
      field.handleChange(digitsOnly);
    },
    [field],
  );

  const focusDigit = useCallback((index: number) => {
    const i = Math.max(0, Math.min(index, DIGIT_COUNT - 1));
    inputRefs.current[i]?.focus();
  }, []);

  const handleDigitChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw.length > 1) {
        const digitsOnly = raw.replace(/\D/g, "").slice(0, DIGIT_COUNT);
        setValue(digitsOnly);
        focusDigit(digitsOnly.length >= DIGIT_COUNT ? DIGIT_COUNT - 1 : digitsOnly.length);
        return;
      }
      const char = raw.replace(/\D/g, "");
      const newDigits = [...digits];
      newDigits[index] = char;
      const newValue = newDigits.join("").trimEnd();
      setValue(newValue);
      if (char) focusDigit(index + 1);
    },
    [digits, setValue, focusDigit],
  );

  const handleDigitKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (!digits[index] && index > 0) {
          e.preventDefault();
          const newDigits = [...digits];
          newDigits[index - 1] = " ";
          setValue(newDigits.join("").trimEnd());
          setTimeout(() => focusDigit(index - 1), 0);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusDigit(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusDigit(index + 1);
      }
    },
    [digits, setValue, focusDigit],
  );

  const handleDigitPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
      setValue(pasted);
      focusDigit(Math.min(pasted.length, DIGIT_COUNT - 1));
    },
    [setValue, focusDigit],
  );

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={hiddenInputId} data-testid={`label-${field.name}`}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <input
        type="hidden"
        id={hiddenInputId}
        name={field.name}
        value={value}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
      <div
        role="group"
        aria-label={label}
        className="flex gap-1.5 sm:gap-2"
        data-testid={`six-digit-code-${field.name}`}
      >
        {Array.from({ length: DIGIT_COUNT }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={i === 0 ? autoFocus : undefined}
            maxLength={DIGIT_COUNT}
            aria-label={`Digit ${i + 1}`}
            data-testid={`digit-input-${i}`}
            value={digits[i] === " " ? "" : digits[i]}
            className={cn(
              digitInputClassName,
              "h-10 w-9 text-center text-lg tabular-nums sm:w-10 p-0",
            )}
            onBlur={field.handleBlur}
            onChange={(e) => handleDigitChange(i, e)}
            onKeyDown={(e) => handleDigitKeyDown(i, e)}
            onPaste={handleDigitPaste}
            aria-invalid={isInvalid}
            {...props}
          />
        ))}
      </div>
      {isInvalid && (
        <FieldError
          data-testid={`error-message-${field.name}`}
          errors={field.state.meta.errors}
        />
      )}
    </Field>
  );
};

export default SixDigitCodeField;
