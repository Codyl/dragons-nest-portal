import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { QRCodeSVG } from "qrcode.react";

const MFAConnectForm = () => {
  const {
    mutate: connectAuthenticator,
    data,
    error,
    isPending,
  } = useMutation({
    mutationFn: AuthServices.connectAuthenticatorApp,
  });

  const schema = z.object({
    userCode: z.string().min(1, "User code is required"),
  });

  const form = useForm({
    defaultValues: {
      userCode: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      connectAuthenticator(value);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0"
      >
        <form.Field
          name="userCode"
          children={(field) => <InputField field={field} label="User Code" autoFocus />}
        />
        <Button type="submit" disabled={isPending} isPending={isPending}>
          Connect Authenticator
        </Button>
      </form>
      {data !== null && data !== undefined && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <QRCodeSVG value={data.qrString} />
          <pre className="text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-destructive mt-2" data-testid="error-message">
            Error: {error.message ?? "Unknown error"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MFAConnectForm;
