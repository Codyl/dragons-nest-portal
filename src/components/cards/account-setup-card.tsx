import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccountSetupForm } from '@/components/forms/account-setup.form';

type AccountSetupCardProps = {
  stepIcon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

const AccountSetupCard = ({
  stepIcon,
  title,
  subtitle,
  children,
  footer,
}: AccountSetupCardProps) => {
  const { stepIndex, totalSteps } = useAccountSetupForm();
  const filledSegments = Math.min(stepIndex + 1, totalSteps);

  return (
    <div className="flex min-h-full w-full items-center justify-center p-4 py-10">
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl bg-white px-6 py-8 shadow-md sm:px-10',
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#6d8567] text-white shadow-sm"
            aria-hidden
          >
            <Flame
              className="h-7 w-7"
              strokeWidth={1.75}
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Welcome to Dragon&apos;s Nest
          </h1>
          <p className="mt-1 text-sm text-stone-500 sm:text-base">
            Let&apos;s set up your learning journey
          </p>
          <div
            className="mt-6 flex w-full max-w-md gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={filledSegments}
            aria-label={`Step ${filledSegments} of ${totalSteps}`}
          >
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  i < filledSegments ? 'bg-[#8b7355]' : 'bg-[#ebe6dc]',
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div
            className="mb-3 text-[#8b7355]"
            aria-hidden
          >
            {stepIcon}
          </div>
          <h2 className="text-lg font-bold text-stone-900 sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>

        <div className="mt-8 space-y-6">{children}</div>

        <div className="mt-8">{footer}</div>
      </div>
    </div>
  );
};

export default AccountSetupCard;
