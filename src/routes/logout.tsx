import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { Button } from "@/components/ui/button";
import InputField from "@/components/fields/input-field";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export const Route = createFileRoute("/logout")({
    component: Logout
});

function Logout() {
    const { mutate: logout, data, error, isPending } = useMutation({
        mutationFn: AuthServices.logout
    });

    const schema = z.object({
        accessToken: z.string().min(1, "Access token is required")
    });

    const form = useForm({
        defaultValues: {
            accessToken: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            logout(value.accessToken);
        }
    });

    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Logout</h2>
            <div className="flex flex-col gap-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0">
                    <form.Field
                        name="accessToken"
                        children={(field) => (
                            <InputField field={field} label="Access Token" type="password" />
                        )}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Logging out..." : "Logout"}
                    </Button>
                </form>
                {data && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <p className="text-red-600 dark:text-red-400">
                            Error: {error instanceof Error ? error.message : "Unknown error"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
