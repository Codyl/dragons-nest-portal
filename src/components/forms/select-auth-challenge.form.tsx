import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import useSelectAuthChallenge from "@/hooks/use-select-auth-challenege";
import { FieldContent, FieldGroup, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";

const SelectAuthChallengeForm = ({
  availableChallenges,
  setStep,
}: {
  availableChallenges: string[];
  setStep: (step: 1 | 2 | 3) => void;
}) => {
  const {
    mutate: selectAuthChallenge,
    error,
    isPending,
  } = useSelectAuthChallenge();
  const selectAuthChallengeForm = useForm({
    defaultValues: {
      method: "",
    },
    validators: {
      onSubmit: z.object({
        method: z.string().min(1, "Method is required"),
      }),
    },
    onSubmit: ({ value }) => {
      selectAuthChallenge(
        {
          challengeName: value.method,
          username: sessionStorage.getItem("username") || "",
          session: sessionStorage.getItem("session") || "",
        },
        {
          onSuccess: () => {
            setStep(3);
          },
        },
      );
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selectAuthChallengeForm.handleSubmit();
      }}
    >
      <selectAuthChallengeForm.Field
        name="method"
        children={(field) => (
          <FieldGroup>
            <FieldLabel>Choose a verification method</FieldLabel>
            <FieldContent>
              <RadioGroup
                className="flex flex-col space-y-1"
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                }}
              >
                {availableChallenges.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <RadioGroupItem value={challenge} id={challenge} />
                    <Label htmlFor={challenge} className="cursor-pointer">
                      {challenge}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FieldContent>
          </FieldGroup>
        )}
      />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Loading..." : "Continue"}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      )}
    </form>
  );
};

export default SelectAuthChallengeForm;
