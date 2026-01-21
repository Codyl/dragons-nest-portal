import { useQuery } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { QRCodeSVG } from "qrcode.react";

const MFAGenerateSecretForm = () => {
  const { data, error } = useQuery({
    queryKey: ["generate-authenticator-secret"],
    queryFn: () =>
      AuthServices.generateAuthenticatorSecret({
        session: sessionStorage.getItem("session") || "",
      }),
  });

  return (
    <div className="flex flex-col gap-4">
      {data && data.qrString && !error && <QRCodeSVG value={data.qrString} />}

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
