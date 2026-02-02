import useLoggedInUser from "@/hooks/use-logged-in-user";
import useRegisterPasskey from "@/hooks/use-register-passkey";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ChangePasswordModal from "../modals/change-password.modal";

const LoginMethod = ({ method, onClick, buttonText, className, disabled }: { method: string, onClick: () => void, buttonText: string, className?: string, disabled?: boolean }) => {
  return (
    <div className={cn("flex flex-col w-full gap-2 tablet:flex-row justify-between items-center", className)}>
      <div>{method}</div>
      <Button type="button" onClick={onClick} variant="outline" disabled={disabled}>{buttonText}</Button>
    </div>
  );
};

const LoginMethodSettingsSection = ({ className }: { className?: string }) => {
  const userData = useLoggedInUser();
  const user = userData.data?.data;
  const registerPasskey = useRegisterPasskey();

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  return (
    <>
      <ChangePasswordModal show={showChangePasswordModal} setShow={setShowChangePasswordModal} />
      <div className={className}>
        <h1 className="text-2xl font-bold">Login Methods</h1>
        <div className="text-muted-foreground mt-2">Manage your login methods and connected services.</div>
        <div className="flex flex-col gap-2 mt-2 divide-y max-w-102 w-full">
          {/* allow user to remove sso login methods and change password */}
          <LoginMethod className="py-2" method="Email & Password" buttonText="Change Password" onClick={() => setShowChangePasswordModal(true)} />
          <LoginMethod className="py-2" method="Google" buttonText={user?.loginMethods?.includes("GOOGLE") ? "Remove" : "Connect"} onClick={() => { }} />
          <LoginMethod
            className="py-2"
            method="Passkey"
            buttonText="Register Passkey"
            onClick={() => registerPasskey.mutate()}
            disabled={registerPasskey.isPending}
          />
        </div>
        {registerPasskey.isPending && (
          <p className="text-muted-foreground text-sm mt-2">Completing passkey registration…</p>
        )}
        {registerPasskey.isError && (
          <p className="text-destructive text-sm mt-2" data-testid="passkey-error">
            {registerPasskey.error?.message ?? "Passkey registration failed."}
          </p>
        )}
        {registerPasskey.isSuccess && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2" data-testid="passkey-success">
            Passkey registered successfully.
          </p>
        )}
      </div>
    </>
  );
};

export default LoginMethodSettingsSection;