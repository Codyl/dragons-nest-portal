import useLoggedInUser from '@/hooks/use-logged-in-user';
import useLinkGoogle from '@/hooks/use-link-google';
import useUnlinkGoogle from '@/hooks/use-unlink-google';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import ChangePasswordModal from '../modals/change-password.modal';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from '@tanstack/react-router';

export const UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE =
  'You must create a password before you can disconnect your Google account.';

const LoginMethod = ({
  method,
  onClick,
  buttonText,
  className,
  disabled,
}: {
  method: string;
  onClick: () => void;
  buttonText: string;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <div
      className={cn(
        'flex w-full gap-2 justify-between items-center',
        className,
      )}
    >
      <div>{method}</div>
      <Button
        type="button"
        data-testid={`${buttonText}-button`}
        onClick={onClick}
        variant="outline"
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const LoginMethodSettingsSection = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const userData = useLoggedInUser();
  const user = userData.data?.data;
  const linkGoogle = useLinkGoogle();
  const unlinkGoogle = useUnlinkGoogle();
  const hasGoogle = user?.loginMethods?.includes('GOOGLE');
  const hasPassword = user?.hasPassword ?? true;
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleConnectGoogle = (credential: string) => {
    linkGoogle.mutate({ credential });
  };

  const disableRemoveGoogle = hasGoogle && !hasPassword;
  const [unlinkPopoverOpen, setUnlinkPopoverOpen] = useState(false);
  const unlinkPopoverCloseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scheduleUnlinkPopoverClose = () => {
    unlinkPopoverCloseTimerRef.current = setTimeout(
      () => setUnlinkPopoverOpen(false),
      150,
    );
  };
  const cancelUnlinkPopoverClose = () => {
    if (unlinkPopoverCloseTimerRef.current) {
      clearTimeout(unlinkPopoverCloseTimerRef.current);
      unlinkPopoverCloseTimerRef.current = null;
    }
  };

  return (
    <>
      {hasPassword && (
        <ChangePasswordModal
          show={showChangePasswordModal}
          setShow={setShowChangePasswordModal}
        />
      )}
      <div className={className}>
        <h1 className="text-2xl font-bold">Login Methods</h1>
        <div className="text-muted-foreground mt-2">
          Manage your login methods and connected services.
        </div>
        <div className="flex flex-col gap-2 mt-2 divide-y w-full">
          {/* allow user to remove sso login methods and change password */}
          <LoginMethod
            className="py-2"
            method="Email & Password"
            buttonText={hasPassword ? 'Change Password' : 'Create Password'}
            onClick={() =>
              hasPassword
                ? setShowChangePasswordModal(true)
                : navigate({ to: '/create-password' })
            }
          />
          <div
            className={cn(
              'flex w-full gap-2 justify-between items-center py-2',
            )}
          >
            <div>Google</div>
            {hasGoogle ? (
              <div className="flex flex-col items-end w-full tablet:w-auto">
                {disableRemoveGoogle ? (
                  <Popover
                    open={unlinkPopoverOpen}
                    onOpenChange={setUnlinkPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <span
                        className="inline-flex"
                        data-testid="unlink-google-trigger"
                        onMouseEnter={() => {
                          cancelUnlinkPopoverClose();
                          setUnlinkPopoverOpen(true);
                        }}
                        onMouseLeave={scheduleUnlinkPopoverClose}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled
                          data-testid="unlink-google-disabled"
                        >
                          Remove
                        </Button>
                      </span>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="end"
                      onMouseEnter={cancelUnlinkPopoverClose}
                      onMouseLeave={scheduleUnlinkPopoverClose}
                      data-testid="unlink-google-password-required"
                    >
                      <p className="text-sm text-destructive">
                        {UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-sm underline font-medium hover:no-underline text-primary"
                        onClick={() => {
                          setUnlinkPopoverOpen(false);
                          navigate({ to: '/create-password' });
                        }}
                      >
                        Set a password
                      </button>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => unlinkGoogle.mutate()}
                    disabled={unlinkGoogle.isPending}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <>
                {!window.Cypress && (
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleConnectGoogle(credentialResponse.credential);
                      }
                    }}
                    onError={() => { }}
                  />
                )}
                {window.Cypress && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleConnectGoogle('mock-google-credential')
                    }
                    disabled={linkGoogle.isPending}
                  >
                    Connect
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginMethodSettingsSection;
