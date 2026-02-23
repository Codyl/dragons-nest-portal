
import { cn } from "@/lib/utils";
import useKnownDevices from "@/hooks/use-known-devices";
import useLoggedInUser from "@/hooks/use-logged-in-user";
import { formatDate } from "@/utils/helpers/formatting.helpers";
import ActionPopover from "../popovers/action-popover";
import { useState } from "react";
import DeviceDetailsModal from "../modals/device-details.modal";
import useForgetDevice from "@/hooks/use-forget-device";

const UserDevice = ({ device, className }: { device: { DeviceKey: string, DeviceName: string, DeviceLastIPUsed: string, DeviceLastAuthenticatedDate: string, DeviceLastModifiedDate: string, DeviceCreateDate: string, City: string, Region: string, Country: string }, onClick: () => void, buttonText: string, className?: string }) => {
  const [showDeviceDetailsModal, setShowDeviceDetailsModal] = useState(false);
  const forgetDeviceMutation = useForgetDevice();

  return (
    <>
      <DeviceDetailsModal show={showDeviceDetailsModal} setShow={setShowDeviceDetailsModal} deviceDetails={device} />
      <div className={cn("flex flex-col w-full max-w-102 gap-2 tablet:flex-row justify-between items-center", className)}>
        <div className="font-bold">{device.DeviceName || "Unknown Device"}</div>
        <div className="text-muted-foreground">{device.DeviceLastIPUsed || "Unknown IP"}</div>
        <div className="text-muted-foreground">{formatDate(device.DeviceLastAuthenticatedDate) || "Unknown Date"}</div>
        <ActionPopover actions={[{
          label: "Forget Device", onClick: () => {
            forgetDeviceMutation.mutate({
              deviceKey: device.DeviceKey,
            });
          }
        }, { label: "See more details", onClick: () => { setShowDeviceDetailsModal(true) } }]} />
      </div>
    </>
  );
};

const UserDeviceSettingsSection = ({ className }: { className?: string }) => {
  const { data: userData } = useLoggedInUser();
  const { data } = useKnownDevices();

  if (userData?.data?.hasPassword === false) {
    return null;
  }

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">User Device Settings</h1>
      <div className="text-muted-foreground mt-2">Manage your devices and connected services.</div>
      <div className="flex flex-col mt-2 divide-y">
        {data?.data.map((device: any) => (
          <UserDevice key={device.DeviceKey} device={device} onClick={() => { }} buttonText="Forget Device" />
        ))}
      </div>
    </div>
  );
};

export default UserDeviceSettingsSection;