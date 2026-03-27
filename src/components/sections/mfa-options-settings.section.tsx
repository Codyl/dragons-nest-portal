import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useUpdateMFAPreference from '@/hooks/use-update-mfa-preference';
import { useQueryClient } from '@tanstack/react-query';
import MFAAuthenticatorQRCodeModal from '../modals/mfa-authenticator-qrcode.modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const TOTPSettings = ({ className }: { className?: string }) => {
  const { data } = useLoggedInUser();
  const hasBeenSetup = data?.data?.softwareTokenMfaEnabled;
  const userEmail = data?.data?.email;

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const queryClient = useQueryClient();
  const { mutate: setMFAPreference, isPending: isRemoving } =
    useUpdateMFAPreference();

  const handleRemove = () => {
    setMFAPreference(
      { softwareTokenMfaEnabled: false },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
          setShowRemoveConfirm(false);
        },
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col tablet:flex-row gap-2 w-full justify-between items-center',
          className,
        )}
      >
        <div>Authenticator App MFA</div>
        <div className="flex flex-row gap-2">
          {hasBeenSetup ? (
            <Button
              type="button"
              onClick={() => setShowRemoveConfirm(true)}
              variant="outline"
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing…' : 'Remove'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setShowSetupModal(true)}
              variant="outline"
            >
              Setup
            </Button>
          )}
        </div>
      </div>
      <MFAAuthenticatorQRCodeModal
        show={showSetupModal}
        setShow={setShowSetupModal}
        source="settings"
        userEmail={userEmail}
      />
      <AlertDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Authenticator App MFA?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be required to enter a code from your
              authenticator app when signing in. You can set it up again later
              from this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const MFAOptionsSettingsSection = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">User MFA Options Settings</h1>
      <div className="text-muted-foreground mt-2">
        Manage your MFA options and connected services.
      </div>
      <div className="flex flex-col gap-2 mt-2 divide-y max-w-102 w-full">
        <TOTPSettings className="py-2" />
      </div>
    </div>
  );
};

export default MFAOptionsSettingsSection;
