import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<
  ComponentProps<'input'>,
  'type' | 'onCheckedChange'
> & {
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  className,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        'border-input text-primary focus-visible:ring-ring/50 mt-0.5 size-4 shrink-0 cursor-pointer rounded-[4px] border shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked);
        onChange?.(e);
      }}
      {...props}
    />
  );
}

export { Checkbox };
