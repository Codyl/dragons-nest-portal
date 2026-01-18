import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import useLoginMutation from "@/hooks/use-login-mutation";
import { useRouter } from "@tanstack/react-router";

const LoginForm = ({ session }: { session?: string }) => {
    const router = useRouter();
    const { mutate: login, data, error, isPending } = useLoginMutation();

    const schema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z
            .string()
            .min(6, "Password must be at least 8 characters long")
    });

    const form = useForm({
        defaultValues: {
            username: "codylillyw@gmail.com",
            password: "123123"
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            // Only include session if provided
            login(
                {
                    username: value.username,
                    password: value.password,
                    session
                },
                {
                    onSuccess: (data) => {
                        console.log(data.response);
                        sessionStorage.setItem(
                            "session",
                            data.response.Session
                        );
                        sessionStorage.setItem("username", value.username);
                        sessionStorage.setItem("password", value.password);
                    },
                    onError: (error) => {
                        console.dir(error.response.data);
                        if (error.name === "UserNotConfirmedException") {
                            sessionStorage.setItem("username", value.username);
                            router.navigate({ to: "/confirm-signup" });
                        }
                    }
                }
            );
        }
    });
    return (
        <div className="flex flex-col gap-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0">
                <form.Subscribe selector={(state) => state.fieldMeta}>
                    {(fieldMeta) => (
                        <pre>
                            {Object.entries(fieldMeta).map(([name, meta]) => (
                                <div key={name}>
                                    {name}: {meta.isValid ? "✅" : "❌"} |
                                    Touched: {meta.isTouched ? "Y" : "N"}
                                    {meta.errors.length > 0 &&
                                        ` | Error: ${meta.errors.join(", ")}`}
                                </div>
                            ))}
                        </pre>
                    )}
                </form.Subscribe>
                <form.Field
                    name="username"
                    children={(field) => (
                        <InputField field={field} label="Username" />
                    )}
                />
                <form.Field
                    name="password"
                    children={(field) => (
                        <InputField
                            field={field}
                            label="Password"
                            type="password"
                        />
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Logging in..." : "Login"}
                </Button>
            </form>
            {data !== undefined && data !== null && (
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

export default LoginForm;
