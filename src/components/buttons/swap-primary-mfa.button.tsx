import { Button } from "../ui/button";
import useUpdateMFAPreference from "@/hooks/use-update-mfa-preference";

const SwapPrimaryMFAButton = ({ preferredMfa }: { preferredMfa: string }) => {
  const { mutate: updateMFAPreference } = useUpdateMFAPreference();

  return (
    <Button variant="link" onClick={() => {
      updateMFAPreference({
        preferredMfa,
      });
    }}>
      Set as Primary
    </Button>
  );
};

export default SwapPrimaryMFAButton;