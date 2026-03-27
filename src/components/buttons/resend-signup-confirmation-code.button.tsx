import { useMutation } from '@tanstack/react-query';
import { Button } from '../ui/button';
import AuthServices from '@/api/services/auth.services';
import { toast } from 'sonner';

const ResendSignupConfirmationCodeButton = () => {
  const {
    mutate: resendCode,
    isPending,
    error,
  } = useMutation({
    mutationFn: AuthServices.resendSignupConfirmationCode,
    onSuccess: () => {
      toast.success(`Code resent to ${sessionStorage.getItem('username')}.`);
    },
  });

  return (
    <>
      <Button
        variant="link"
        type="button"
        disabled={isPending}
        onClick={() =>
          resendCode({
            username: sessionStorage.getItem('username') || '',
          })
        }
        isPending={isPending}
      >
        Resend Code
      </Button>
      {error && <p className="text-destructive">Error: {error.message}</p>}
    </>
  );
};

export default ResendSignupConfirmationCodeButton;
