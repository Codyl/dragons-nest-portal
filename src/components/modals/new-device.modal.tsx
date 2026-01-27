import useRememberDevice from "@/hooks/use-remember-device";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";

const NewDeviceModal = () => {
  const [show, setShow] = useState(true);
  const rememberDeviceMutation = useRememberDevice({
    onSuccess: () => {
      localStorage.setItem("AddedDeviceKey", localStorage.getItem("DeviceKey") || "");
      setShow(false);
    }
  });

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <h2>Would you like to remember this device?</h2>
        <p>This will allow you to login to your account from this device without having to verify your identity.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            rememberDeviceMutation.mutate({
              deviceKey: localStorage.getItem("DeviceKey") || "",
              shouldRememberDevice: true,
            })
          }}>Yes, this is my device</Button>
          <Button variant="link" onClick={() => { localStorage.setItem("isOptedOut", "true") }}>No, other people use this device</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeviceModal;