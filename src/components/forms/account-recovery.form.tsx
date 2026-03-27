import { Link } from '@tanstack/react-router';

const AccountRecoveryForm = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        After support verifies your recent account activity, they can send a
        one-time magic link. Opening that link signs you in immediately and
        bypasses password and TOTP challenges.
      </p>
      <div className="rounded-md border p-3 text-sm">
        <p className="font-medium">Need recovery?</p>
        <p className="text-muted-foreground">
          Contact support and request an account recovery magic link.
        </p>
      </div>
      <div className="text-sm text-muted-foreground">
        If you no longer have access to your saved email and phone number, this
        recovery path is unavailable.
      </div>
      <div className="text-center text-sm space-y-2">
        <Link
          to="/login"
          className="text-primary hover:underline"
        >
          Back to sign in
        </Link>
        <div>
          <Link
            to="/signup"
            className="text-primary hover:underline"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountRecoveryForm;
