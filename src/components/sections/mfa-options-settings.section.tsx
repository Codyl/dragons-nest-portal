import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import SwapPrimaryMFAButton from "../buttons/swap-primary-mfa.button";
import useUpdateMFAPreference from "@/hooks/use-update-mfa-preference";

const MFAOption = ({ optionText, className, isPrimary, hasBeenSetup, preferredMfa }: { optionText: string, className?: string, isPrimary?: boolean, hasBeenSetup?: boolean, preferredMfa: string }) => {
  const { mutate: updateMFAPreference } = useUpdateMFAPreference();

  return (
    <div className={cn("flex flex-col tablet:flex-row gap-2 w-full justify-between items-center", className)}>
      <div>{optionText}</div>
      <div className="flex flex-row gap-2">
        {isPrimary ? <div>Primary</div> : <SwapPrimaryMFAButton preferredMfa={preferredMfa} />}
        {hasBeenSetup ? <Button type="button" onClick={() => { updateMFAPreference({ softwareTokenMfaEnabled: false, preferredMfa: undefined }) }} variant="outline">Remove</Button> : <Button type="button" onClick={() => { updateMFAPreference({ softwareTokenMfaEnabled: true }) }} variant="outline">Setup</Button>}
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
        <MFAOption className="py-2" optionText="SMS MFA" preferredMfa="sms" />
        <MFAOption className="py-2" optionText="WebAuthn MFA" preferredMfa="softwareToken" />
        <MFAOption className="py-2" optionText="Key MFA" preferredMfa="key" />
      </div>
    </div>
  );
};

export default MFAOptionsSettingsSection;