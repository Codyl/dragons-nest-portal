import { Button } from "@/components/ui/button";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import useSelectAuthChallenge from "@/hooks/use-select-auth-challenge";
import { useRouter } from "@tanstack/react-router";

const SelectAuthChallengeForm = ({
  // availableChallenges,
  username,
}: {
  availableChallenges: string[];
  username: string;
}) => {
  const router = useRouter();

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
      // TODO: Navigate to the appropriate page based on the method
      selectAuthChallenge(
        {
          challengeName: value.method,
          username: username,
          session: sessionStorage.getItem("session") || "",
        },
        {
          onSuccess: () => {
            router.navigate({ to: "/mfa/verify-code" });
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
      {error && <div className="text-red-500">{error.message}</div>}
      <Button type="submit" disabled={isPending} isPending={isPending}>
        Continue
      </Button>
    </form>
  );
};

export default SelectAuthChallengeForm;
