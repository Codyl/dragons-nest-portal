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
  /** Defaults to course-removal copy when omitted. */
  title?: string;
  description?: string;
  confirmLabel?: string;
};

const RemoveConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  isPending,
  title = 'Remove Course',
  description = 'Are you sure you want to remove this course? This action cannot be undone.',
  confirmLabel = 'Remove',
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveConfirmDialog;
