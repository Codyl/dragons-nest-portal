import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const MFAOption = ({ option, onClick, className, isPrimary, hasBeenSetup }: { option: string, onClick: () => void, buttonText: string, className?: string, isPrimary?: boolean, hasBeenSetup?: boolean }) => {
  return (
    <div className={cn("flex flex-col tablet:flex-row gap-2 w-full justify-between items-center", className)}>
      <div>{option}</div>
      <div className="flex flex-row gap-2">
        {isPrimary ? <div>Primary</div> : <Button type="button" onClick={onClick} variant="link">Set as Primary</Button>}
        {hasBeenSetup ? <Button type="button" onClick={onClick} variant="outline">Remove</Button> : <Button type="button" onClick={onClick} variant="outline">Setup</Button>}
      </div>
    </div>
  );
};

const MFAOptionsSettingsSection = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">User MFA Options Settings</h1>
      <div className="text-muted-foreground mt-2">Manage your MFA options and connected services.</div>
      <div className="flex flex-col gap-2 mt-2 divide-y max-w-102 w-full">
        <MFAOption className="py-2" option="Email MFA" buttonText="Connect" onClick={() => { }} />
        <MFAOption className="py-2" option="SMS MFA" buttonText="Connect" onClick={() => { }} />
        <MFAOption className="py-2" option="WebAuthn MFA" buttonText="Connect" onClick={() => { }} />
        <MFAOption className="py-2" option="Key MFA" buttonText="Connect" onClick={() => { }} />
      </div>
    </div>
  );
};

export default MFAOptionsSettingsSection;