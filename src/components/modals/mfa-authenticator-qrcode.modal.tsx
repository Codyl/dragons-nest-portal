
import { Dialog, DialogContent } from "../ui/dialog";
import MFAGenerateSecretForm from "../forms/mfa-generate-secret.form";

const MFAAuthenticatorQRCodeModal = ({ show, setShow }: { show: boolean, setShow: (show: boolean) => void }) => {
    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogContent>
                <MFAGenerateSecretForm />
            </DialogContent>
        </Dialog>
    );
};

export default MFAAuthenticatorQRCodeModal;