import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login.form";
import { AuthLayout } from "@/components/auth-layout";
import VerifyUsernameForm from "@/components/forms/verify-username.form";
import { useState } from "react";
import SelectAuthChallengeForm from "@/components/forms/select-auth-challenge.form";

export const Route = createFileRoute("/login")({
    component: Login
});

function Login() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [username, setUsername] = useState("");
    const [availableChallenges, setAvailableChallenges] = useState<string[]>([]);
    return <AuthLayout
            title={step === 1 ? "Sign in" : "Enter password"}
            description={
                step === 1
                    ? "Use your account to sign in"
                    : `Enter the password for ${username}`
            }
        >
        {step === 1 && (
            <VerifyUsernameForm setUsername={setUsername} setStep={setStep} setAvailableChallenges={setAvailableChallenges} />
        )}
        {step === 2 && (
            <SelectAuthChallengeForm availableChallenges={availableChallenges} setStep={setStep} />
        )}
        {step === 3 && (
                <LoginForm setStep={setStep} username={username} />
            )}
        </AuthLayout>;
}
