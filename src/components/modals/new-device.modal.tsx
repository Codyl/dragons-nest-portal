import { forgetDevice } from "aws-amplify/auth";
import { CYPRESS_E2E_SUPPRESS_NEW_DEVICE_MODAL_SESSION_KEY } from "@/constants/cypress-e2e-new-device-modal";
import useRememberDevice from "@/hooks/use-remember-device";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";

const DISMISSED_KEY = "NewDeviceModalDismissed";
const LAST_LOGIN_PROVIDER_KEY = "lastLoginProvider";

function shouldShowModal(): boolean {
  if (
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(CYPRESS_E2E_SUPPRESS_NEW_DEVICE_MODAL_SESSION_KEY) ===
      "1"
  ) {
    return false;
  }
  if (sessionStorage.getItem(LAST_LOGIN_PROVIDER_KEY) === "google") {
    sessionStorage.removeItem(LAST_LOGIN_PROVIDER_KEY);
    return false;
  }
  if (localStorage.getItem("AddedDeviceKey")) return false;
  if (localStorage.getItem("isOptedOut") || localStorage.getItem("IsOptedOut")) return false;
  if (localStorage.getItem(DISMISSED_KEY)) return false;
  return true;
}

const NewDeviceModal = () => {
  const [show, setShow] = useState(shouldShowModal);
  const rememberDeviceMutation = useRememberDevice({
    onSuccess: () => {
      localStorage.setItem("AddedDeviceKey", localStorage.getItem("DeviceKey") || "amplify-remembered");
      setShow(false);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      localStorage.setItem(DISMISSED_KEY, "true");
      setShow(false);
    } else {
      setShow(true);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent>
        <h2>Would you like to remember this device?</h2>
        <p>This will allow you to login to your account from this device without having to verify your identity.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            rememberDeviceMutation.mutate();
          }}>Yes, this is my device</Button>
          <Button variant="link" onClick={async () => {
            try {
              await forgetDevice({ device: { id: localStorage.getItem("DeviceKey") || "" } });
            } catch {
              // Ignore (e.g. device not tracked or not configured)
            }
            localStorage.setItem("isOptedOut", "true");
            setShow(false);
          }}>No, other people use this device</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeviceModal;