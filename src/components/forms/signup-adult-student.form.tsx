import { useForm } from '@tanstack/react-form';
import InputField from '../fields/input-field';
import PasswordInputField from '../fields/password-input-field';
import { Button } from '../ui/button';
import { useMutation } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';
import { useRouter, Link } from '@tanstack/react-router';
import { FieldGroup } from '../ui/field';
import GoogleSSOSignupButton from '../buttons/google-sso-signup.button';
import {
  adultEmailSignupSchema,
  studentAccountSignupSchema,
} from '@/lib/user-account.schema';
import {
  SIGNUP_COPPA_CONSENT_KEY,
  SIGNUP_FAMILY_NAME_KEY,
  SIGNUP_GIVEN_NAME_KEY,
  SIGNUP_ROLE_KEY,
} from '@/utils/constants/signup.constants';

/** Matches backend `AccountType`: adult vs student for this email/password signup form. */
export type SignupAccountType = 'adult' | 'student';

const HEADERS: Record<SignupAccountType, string> = {
  adult: 'Create Your Adult Account',
  student: 'Create Your Student Account',
};

const SignupAdultStudentForm = ({
  accountType,
  submitButtonText = 'Create Account',
  showGoogleSso = true,
  className,
  onBack,
}: {
  accountType: SignupAccountType;
  submitButtonText?: string;
  showGoogleSso?: boolean;
  className?: string;
  onBack?: () => void;
}) => {
  const router = useRouter();
  const {
    mutate: signup,
    error,
    isPending,
  } = useMutation({
    mutationFn: AuthServices.initiateSignup,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any) => {
      if (data.data.Session) {
        sessionStorage.setItem('session', data.data.Session);
      }
      sessionStorage.setItem('username', variables.email);
      sessionStorage.setItem('password', variables.password);
      sessionStorage.setItem(SIGNUP_ROLE_KEY, accountType);
      sessionStorage.removeItem(SIGNUP_COPPA_CONSENT_KEY);
      sessionStorage.removeItem(SIGNUP_GIVEN_NAME_KEY);
      sessionStorage.removeItem(SIGNUP_FAMILY_NAME_KEY);
      router.navigate({ to: '/confirm-signup' });
    },
  });

  const schema =
    accountType === 'adult'
      ? adultEmailSignupSchema
      : studentAccountSignupSchema;

  const form = useForm({
    defaultValues: {
      accountType,
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      signup({
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={className ?? 'space-y-4'}
    >
      <h2 className="text-lg font-semibold tracking-tight">
        {HEADERS[accountType]}
      </h2>
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => (
            <InputField field={field} label="Email" type="text" autoFocus />
          )}
        />
        <form.Field
          name="password"
          children={(field) => (
            <InputField field={field} label="Password" type="password" />
          )}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <InputField
              field={field}
              label="Confirm Password"
              type="password"
            />
          )}
        />
      </FieldGroup>
      {error && <div className="text-sm text-destructive">{error.message}</div>}
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <span data-testid="button-loading-indicator">Creating account…</span>
        ) : (
          submitButtonText
        )}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/verify-username"
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </div>
      {onBack && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground w-full text-center text-sm underline-offset-4 hover:underline"
          data-testid="adult-student-signup-back"
          onClick={onBack}
        >
          Back
        </button>
      )}
      {showGoogleSso && (
        <>
          <hr className="my-4" />
          <div className="flex flex-col items-center gap-2">
            {!window.Cypress && !import.meta.env.STORYBOOK === true && (
              <GoogleSSOSignupButton />
            )}
          </div>
        </>
      )}
    </form>
  );
};

export default SignupAdultStudentForm;
