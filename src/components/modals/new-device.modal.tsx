import useRememberDevice from "@/hooks/use-remember-device";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";

const DISMISSED_KEY = "NewDeviceModalDismissed";
const LAST_LOGIN_PROVIDER_KEY = "lastLoginProvider";

function shouldShowModal(): boolean {
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
      localStorage.setItem("AddedDeviceKey", localStorage.getItem("DeviceKey") || "");
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
            rememberDeviceMutation.mutate({
              deviceKey: localStorage.getItem("DeviceKey") || "",
              shouldRememberDevice: true,
            });
          }}>Yes, this is my device</Button>
          <Button variant="link" onClick={() => {
            localStorage.setItem("isOptedOut", "true");
            setShow(false);
          }}>No, other people use this device</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeviceModal;