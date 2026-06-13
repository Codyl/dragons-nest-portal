import DeleteAccountForm from '../forms/delete-account.form';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const DeleteAccountModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-min">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">Delete Account</DialogTitle>
        <DeleteAccountForm />
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
