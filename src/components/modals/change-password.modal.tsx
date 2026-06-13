import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import ChangePasswordForm from '../forms/change-password.form';
import { Button } from '../ui/button';
import { useRouter } from '@tanstack/react-router';

const ChangePasswordModal = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) => {
  const router = useRouter();

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTitle className="sr-only">Change Password</DialogTitle>
      <DialogContent>
        <ChangePasswordForm onPasswordChangeSuccess={() => setShow(false)} />
        <Button
          variant="link"
          onClick={() => {
            setShow(false);
            router.navigate({ to: '/forgot-password' });
          }}
        >
          Forgot Password?
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
