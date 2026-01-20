import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login.form";

export const Route = createFileRoute("/login")({
    component: Login
});

function Login() {
    return <LoginForm />;
}
