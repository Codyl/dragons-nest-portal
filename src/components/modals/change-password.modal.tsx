import { Dialog, DialogContent } from "../ui/dialog";
import ChangePasswordForm from "../forms/change-password.form";

const ChangePasswordModal = ({ show, setShow }: { show: boolean, setShow: (show: boolean) => void }) => {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <ChangePasswordForm onPasswordChangeSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;