import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";

const PasswordlessAuthChallengeRadioGroup = ({
  selectedChallenge,
  availableChallenges,
  onSelect,
  className,
}: {
  selectedChallenge: string;
  availableChallenges: string[];
  onSelect: (challenge: string) => void;
  className?: string;
}) => {
  return (
    <RadioGroup
      className={cn("flex flex-col space-y-1", className)}
      value={selectedChallenge}
      onValueChange={(value) => {
        onSelect(value);
      }}
    >
      {availableChallenges.map((challenge) => (
        <Button variant="outline" key={challenge}>
          <RadioGroupItem asChild value={challenge} id={challenge} />
          {challenge}
        </Button>
      ))}
    </RadioGroup>
  );
};

export default PasswordlessAuthChallengeRadioGroup;