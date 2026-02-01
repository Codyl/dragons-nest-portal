import { QRCodeSVG } from "qrcode.react";
import InputField from "../fields/input-field";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../ui/button";
import useConnectAuthenticator from "@/hooks/use-connect-authenticator-app";
import useGenerateAuthenticatorSecret from "@/hooks/use-generate-authenticator-secret";
import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";

const MFAGenerateSecretForm = () => {
  const router = useRouter();
  const session = sessionStorage.getItem("session") || "";
  const username = sessionStorage.getItem("username") || "";
  const password = sessionStorage.getItem("password") || "";

  const { data, error } = useGenerateAuthenticatorSecret({
    session: session,
    username: username,
  });

  // Extract the new session from AssociateSoftwareTokenCommand response
  const associateSession = useMemo(() => {
    if (data && typeof data === "object" && "data" in data) {
      const responseData = (data as { data?: { Session?: string } }).data;
      return responseData?.Session || "";
    }
    return "";
  }, [data]);

  // Extract qrString from the response
  const qrString = useMemo(() => {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data?: { qrString?: string } }).data?.qrString || null;
    }
    return null;
  }, [data]);

  const { mutate: connectAuthenticatorApp, isPending, error: connectAuthenticatorError } =
    useConnectAuthenticator();

  const schema = z.object({
    code: z.string().min(1, "Code is required"),
  });

  const form = useForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      // Use the session from AssociateSoftwareTokenCommand response, not the old session
      const sessionToUse = associateSession || session;
      connectAuthenticatorApp(
        {
          friendlyDeviceName: "Authenticator App",
          session: sessionToUse,
          userCode: value.code,
          username: username,
          password: password,
        },
        {
          onSuccess: (data) => {
            if (data.data.Session) {
              sessionStorage.setItem("session", data.data.Session);
            }
            router.navigate({ to: "/mfa/verify-code" });
          },
        },
      );
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1>Scan QR Code</h1>
      <div>Scan this QR code with your authenticator app.</div>
      {qrString && !error && <QRCodeSVG value={qrString} />}
      <div>Enter the code from your authenticator app.</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0"
      >
        <form.Field
          name="code"
          children={(field) => <InputField field={field} label="Code" />}
        />
        <Button type="submit" disabled={isPending} isPending={isPending}>
          Continue
        </Button>
      </form>
      {error?.message && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-destructive mt-2" data-testid="error-message">
            {error.message}
          </p>
        </div>
      )}
      {connectAuthenticatorError?.message && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-destructive mt-2" data-testid="error-message">
            {connectAuthenticatorError.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default MFAGenerateSecretForm;
