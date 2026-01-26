import useLoggedInUser from "@/hooks/use-logged-in-user";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ChangePasswordModal from "../modals/change-password.modal";

const LoginMethod = ({ method, onClick, buttonText, className }: { method: string, onClick: () => void, buttonText: string, className?: string }) => {
  return (
    <div className={cn("flex flex-col w-full max-w-64 gap-2 tablet:flex-row justify-between items-center", className)}>
      <div>{method}</div>
      <Button type="button" onClick={onClick} variant="outline">{buttonText}</Button>
    </div>
  );
};

const LoginMethodSettingsSection = ({ className }: { className?: string }) => {
  const userData = useLoggedInUser();
  const user = userData.data?.data;

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  return (
    <>
      <ChangePasswordModal show={showChangePasswordModal} setShow={setShowChangePasswordModal} />
      <div className={className}>
        <h1 className="text-2xl font-bold">Login Methods</h1>
        <div className="text-muted-foreground mt-2">Manage your login methods and connected services.</div>
        <div className="flex flex-col gap-2 mt-2 divide-y">
          {/* allow user to remove sso login methods and change password */}
          <LoginMethod className="py-2" method="Email & Password" buttonText="Change Password" onClick={() => setShowChangePasswordModal(true)} />
          <LoginMethod className="py-2" method="Google" buttonText={user?.loginMethods?.includes("GOOGLE") ? "Remove" : "Connect"} onClick={() => { }} />
          <LoginMethod className="py-2" method="Email Single Sign On" buttonText={user?.loginMethods?.includes("EMAIL") ? "Remove" : "Connect"} onClick={() => { }} />
          <LoginMethod className="py-2" method="SMS Single Sign On" buttonText={user?.loginMethods?.includes("SMS") ? "Remove" : "Connect"} onClick={() => { }} />
          <LoginMethod className="py-2" method="WebAuthn Single Sign On" buttonText={user?.loginMethods?.includes("WEB_AUTHN") ? "Remove" : "Connect"} onClick={() => { }} />
        </div>
      </div>
    </>
  );
};

export default LoginMethodSettingsSection;