import { z } from "zod";
import InputField from "../fields/input-field";
import { FieldGroup } from "../ui/field";
import { useForm } from "@tanstack/react-form";
import { Button } from "../ui/button";

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
      sessionStorage.setItem("code", value.code);
    },
  });
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <FieldGroup>
        <form.Field
          name="code"
          children={(field) => (
            <InputField field={field} label="Code" type="text" />
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default ConfirmResetCodeForm;
