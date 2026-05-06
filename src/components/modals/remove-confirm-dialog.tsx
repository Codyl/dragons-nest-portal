import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type RemoveConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

const RemoveConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  isPending,
}: RemoveConfirmDialogProps) => {
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
            Are you sure you want to remove this course? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
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

export default RemoveConfirmDialog;
