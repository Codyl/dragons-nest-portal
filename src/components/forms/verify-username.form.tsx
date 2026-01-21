import { z } from "zod";
import { Button } from "../ui/button";
import { useForm } from "@tanstack/react-form";
import { FieldGroup } from "../ui/field";
import InputField from "../fields/input-field";
import { Link } from "@tanstack/react-router";
import useVerifyUsername from "@/hooks/use-verify-username";

const VerifyUsernameForm = ({ setUsername, setStep, setAvailableChallenges }: { setUsername: (username: string) => void, setStep: (step: 1 | 2 | 3) => void, setAvailableChallenges: (challenges: string[]) => void }) => {
    const { mutate: verifyUsername, error, isPending } = useVerifyUsername();
      const usernameSchema = z.object({
        username: z.string().min(1, "Email or username is required")
      });
      
      const usernameForm = useForm({
        defaultValues: {
            username: ""
        },
        validators: {
            onSubmit: usernameSchema
        },
        onSubmit: async ({ value }) => {
            verifyUsername({
                email: value.username,
            }, {
              onSuccess: (result) => {
                sessionStorage.setItem("session", result.response.Session);
                setUsername(value.username);
                setAvailableChallenges(result.response.AvailableChallenges);
                setStep(2);
              }
            });
        }
      });
  
    return <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        usernameForm.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <FieldGroup>
                        <usernameForm.Field
                            name="username"
                            children={(field) => (
                                <InputField
                                    field={field}
                                    label="Email or username"
                                />
                            )}
                        />
                    </FieldGroup>
                    <Button type="submit" className="w-full" disabled={isPending} isPending={isPending}>
                        Next
      </Button>
      {error && <p className="text-red-500">{error.message}</p>}
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>;
};

export default VerifyUsernameForm;