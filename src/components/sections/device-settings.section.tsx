import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const UserDevice = ({ deviceName, onClick, buttonText, className }: { deviceName: string, onClick: () => void, buttonText: string, className?: string }) => {
  return (
    <div className={cn("flex flex-col w-full max-w-64 gap-2 tablet:flex-row justify-between items-center", className)}>
      <div>{deviceName}</div>
      <Button type="button" onClick={onClick} variant="outline">{buttonText}</Button>
    </div>
  );
};

const UserDeviceSettingsSection = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">User Device Settings</h1>
      <div className="text-muted-foreground mt-2">Manage your devices and connected services.</div>
      <div className="flex flex-col mt-2 divide-y">
        <UserDevice className="py-2" deviceName="Device 1" buttonText="Remove" onClick={() => { }} />
        <UserDevice className="py-2" deviceName="Device 2" buttonText="Remove" onClick={() => { }} />
        <UserDevice className="py-2" deviceName="Device 3" buttonText="Remove" onClick={() => { }} />
      </div>
    </div>
  );
};

export default UserDeviceSettingsSection;