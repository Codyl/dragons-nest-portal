import { QRCodeSVG } from "qrcode.react";
import SixDigitCodeField from "../fields/six-digit-code-field";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../ui/button";
import useConnectAuthenticator from "@/hooks/use-connect-authenticator-app";
import useGenerateAuthenticatorSecret from "@/hooks/use-generate-authenticator-secret";
import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const MFAGenerateSecretForm = ({
  source,
  userEmail,
  onSetupSuccess,
}: {
  source?: "login" | "settings";
  userEmail?: string;
  onSetupSuccess?: () => void;
} = {}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isSettings = source === "settings";
  const session = isSettings ? "" : (sessionStorage.getItem("session") || "");
  const username = isSettings ? (userEmail ?? "") : (sessionStorage.getItem("username") || "");
  const password = isSettings ? "" : (sessionStorage.getItem("password") || "");

  const { data, error, isPending: isGeneratingSecret } = useGenerateAuthenticatorSecret({
    session,
    username,
    enabled: isSettings ? !!userEmail : !!(session && username),
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
    code: z
      .string()
      .min(6, "Code must be 6 digits")
      .max(6, "Code must be 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
  });

  const form = useForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const sessionToUse = associateSession || session;
      connectAuthenticatorApp(
        {
          friendlyDeviceName: "Authenticator App",
          session: sessionToUse,
          userCode: value.code,
          username: isSettings ? "" : username,
          password: isSettings ? "" : password,
        },
        {
          onSuccess: (data) => {
            if (isSettings) {
              queryClient.invalidateQueries({ queryKey: ["user", "me"] });
              onSetupSuccess?.();
            } else {
              if (data.data.Session) {
                sessionStorage.setItem("session", data.data.Session);
              }
              router.navigate({ to: "/mfa/verify-code" });
            }
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
      {isGeneratingSecret && <div className="animate-pulse bg-muted rounded-md size-32" />}
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
          children={(field) => <SixDigitCodeField field={field} label="Code" autoFocus />}
        />
        <Button type="submit" disabled={isPending} isPending={isPending}>
          Continue
        </Button>
      </form>
      {error?.message && (
        <p className="text-destructive" data-testid="error-message">
          {error.message}
        </p>
      )}
      {connectAuthenticatorError?.message && (
        <p className="text-destructive" data-testid="error-message">
          {connectAuthenticatorError.message}
        </p>
      )}
    </div>
  );
};

export default MFAGenerateSecretForm;
