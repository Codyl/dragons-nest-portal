import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type RemoveWarningDialogProps = {
  open: boolean;
  enrollmentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

const RemoveWarningDialog = ({
  open,
  enrollmentCount,
  onConfirm,
  onCancel,
  isPending,
}: RemoveWarningDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Remove Course</DialogTitle>
          <DialogDescription>
            This course currently has {enrollmentCount}{' '}
            {enrollmentCount === 1 ? 'manageduser' : 'managedusers'} enrolled. Removing
            it will notify the parents of all affected enrolled managedusers that
            this class is no longer available.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveWarningDialog;
