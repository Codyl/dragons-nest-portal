import { useQuery } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { QRCodeSVG } from "qrcode.react";

const MFAGenerateSecretForm = () => {
    const { data, error } = useQuery({
        queryKey: ["generate-authenticator-secret"],
        queryFn: () =>
            AuthServices.generateAuthenticatorSecret({
                session: sessionStorage.getItem("session") || ""
            })
    });

    return (
        <div className="flex flex-col gap-4">
            {data && data.qrString && <QRCodeSVG value={data.qrString} />}
            {data !== null && data !== undefined && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-red-600 dark:text-red-400">
                        Error:{" "}
                        {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MFAGenerateSecretForm;
