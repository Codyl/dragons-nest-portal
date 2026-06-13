import { Dialog, DialogContent } from '../ui/dialog';
import MFAGenerateSecretForm from '../forms/mfa-generate-secret.form';

const MFAAuthenticatorQRCodeModal = ({
  show,
  setShow,
  source,
  userEmail,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  source?: 'login' | 'settings';
  userEmail?: string;
}) => {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <MFAGenerateSecretForm
          source={source}
          userEmail={userEmail}
          onSetupSuccess={
            source === 'settings' ? () => setShow(false) : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default MFAAuthenticatorQRCodeModal;
