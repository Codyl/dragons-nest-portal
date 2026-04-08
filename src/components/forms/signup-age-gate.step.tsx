import { Button } from '../ui/button';
import SelectField from '../fields/select-field';
import { SIGNUP_MONTHS } from '@/utils/constants/signup.constants';
import { cn } from '@/lib/utils';

const monthOptions = SIGNUP_MONTHS.map((m) => ({
  value: String(m.value),
  label: m.label,
}));

const SignupAgeGateStep = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  onContinue,
}: {
  month: number | '';
  year: number | '';
  onMonthChange: (v: number | '') => void;
  onYearChange: (v: number | '') => void;
  onContinue: () => void;
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - i);
  const yearOptions = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));
  const filled = month !== '' && year !== '';

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-sm space-y-8 rounded-2xl border border-border/60 bg-card p-8 shadow-sm',
      )}
    >
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground text-sm">
          Enter your birth month and year to continue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Month"
          id="signup-birth-month"
          options={monthOptions}
          value={month === '' ? '' : String(month)}
          onValueChange={(v) => onMonthChange(v === '' ? '' : Number(v))}
          data-testid="signup-birth-month"
          className="gap-1.5"
        />
        <SelectField
          label="Year"
          id="signup-birth-year"
          options={yearOptions}
          value={year === '' ? '' : String(year)}
          onValueChange={(v) => onYearChange(v === '' ? '' : Number(v))}
          data-testid="signup-birth-year"
          className="gap-1.5"
        />
      </div>

      <Button
        type="button"
        className="h-12 w-full text-base font-medium"
        size="lg"
        disabled={!filled}
        data-testid="age-gate-continue"
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
};

export default SignupAgeGateStep;
