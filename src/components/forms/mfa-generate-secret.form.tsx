
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
  const accessToken = localStorage.getItem("AccessToken") || "";
  const session = sessionStorage.getItem("session") || "";
  const username = sessionStorage.getItem("username") || "";

  const { data, error } = useGenerateAuthenticatorSecret({
    session: session,
    username: username,
    ...(accessToken && { accessToken: accessToken }),
  });

  // Extract the new session from AssociateSoftwareTokenCommand response
  const associateSession = useMemo(() => {
    if (data && typeof data === "object" && "response" in data) {
      const response = (data as { response?: { Session?: string } }).response;
      return response?.Session || "";
    }
    return "";
  }, [data]);

  // Extract qrString from the response
  const qrString = useMemo(() => {
    if (data && typeof data === "object" && "qrString" in data) {
      return (data as { qrString: string }).qrString;
    }
    return null;
  }, [data]);

  const { mutate: connectAuthenticatorApp, isPending } = useConnectAuthenticator();

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
      connectAuthenticatorApp({
        ...(accessToken && { accessToken: accessToken }),
        friendlyDeviceName: "Authenticator App",
        session: sessionToUse,
        userCode: value.code,
      }, {
        onSuccess: () => {
          router.navigate({ to: "/users" });
        },
      });
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
        <form.Field name="code" children={(field) => <InputField field={field} label="Code" />} />
        <Button type="submit" disabled={isPending} isPending={isPending}>
          Continue
        </Button>
      </form>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-red-600 dark:text-red-400">
            Error: {error.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default MFAGenerateSecretForm;
