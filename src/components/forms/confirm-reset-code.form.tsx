import { z } from "zod";
import { AuthLayout } from "../auth-layout";
import InputField from "../fields/input-field";
import { FieldGroup } from "../ui/field";
import { useForm } from "@tanstack/react-form";
const ConfirmResetCodeForm = ({
  setStep,
}: {
  setStep: (step: number) => void;
}) => {
  const form = useForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: z.object({
        code: z.string().min(6, "Code is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      setStep(2);
    },
  });
  return (
    <AuthLayout
      title="Confirm your reset code"
      description="Enter the code sent to your email"
    >
      <form>
        <FieldGroup>
          <form.Field
            name="code"
            children={(field) => (
              <InputField field={field} label="Code" type="text" />
            )}
          />
        </FieldGroup>
      </form>
    </AuthLayout>
  );
};

export default ConfirmResetCodeForm;
