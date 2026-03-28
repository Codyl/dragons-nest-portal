import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, LayoutDashboard, Shield, Sparkles } from 'lucide-react';

export type WelcomePageProps = {
  /** Shown in the headline, e.g. given name or email local-part */
  displayName: string;
  onContinue: () => void;
  /** Disables the primary action (e.g. while the API request is in flight). */
  continueDisabled?: boolean;
};

function WelcomePage({
  displayName,
  onContinue,
  continueDisabled = false,
}: WelcomePageProps) {
  const greeting =
    displayName.trim().length > 0 ? displayName.trim() : 'there';

  return (
    <div className="relative isolate min-h-[min(32rem,calc(100vh-5rem))] overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-muted/40 via-background to-background px-4 py-10 shadow-sm sm:px-8 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm">
          <Sparkles
            className="h-7 w-7 text-primary"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        <Card className="w-full border-border/70 bg-card/95 text-left shadow-md backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2 text-center sm:text-left">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome, {greeting}
            </CardTitle>
            <CardDescription className="text-base">
              Your account is ready. Here is a quick overview of what you can do
              next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-success"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-foreground">
                    You are signed in securely.
                  </span>{' '}
                  Use Security settings to manage passwords, MFA, and devices.
                </span>
              </li>
              <li className="flex gap-3">
                <Shield
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-foreground">
                    Your profile stays under your control.
                  </span>{' '}
                  Update contact details anytime in Account settings.
                </span>
              </li>
              <li className="flex gap-3">
                <LayoutDashboard
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-foreground">
                    This is your home base.
                  </span>{' '}
                  Come back here after you finish setup.
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              data-testid="welcome-continue"
              disabled={continueDisabled}
              onClick={onContinue}
            >
              Continue to dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default WelcomePage;
