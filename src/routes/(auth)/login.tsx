import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login.form";
import VerifyUsernameForm from "@/components/forms/verify-username.form";
import { useState } from "react";
import PasswordlessAuthChallengeRadioGroup from "@/components/radio_groups/passwordless-auth-challenge-radio-group";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/(auth)/login")({
  component: Login,
});

function Login() {
  const [username, setUsername] = useState("");
  const [availableChallenges, setAvailableChallenges] = useState<string[]>([]);
  const [selectedPasswordlessChallenge, setSelectedPasswordlessChallenge] = useState<string>("");
  const availablePasswordlessChallenges = ["WEB_AUTHN", "EMAIL_OTP", "SMS_OTP"].filter(challenge => availableChallenges?.includes(challenge));
  const availablePasswordChallenges = availableChallenges.filter(challenge => !availablePasswordlessChallenges.includes(challenge));

  return (
    <>
      {availableChallenges.length === 0 && (
        <Card className="w-full max-w-md">
          <CardContent>
            <VerifyUsernameForm
              setUsername={setUsername}
              setAvailableChallenges={setAvailableChallenges}
            />
          </CardContent>
        </Card>
      )}
      {availablePasswordChallenges.length > 0 && (
        <Card className="w-full max-w-md">
          <CardContent>
            <LoginForm username={username} />
          </CardContent>
        </Card>
      )}
      {availablePasswordlessChallenges.length > 0 && (
        <PasswordlessAuthChallengeRadioGroup
          className="mt-4"
          selectedChallenge={selectedPasswordlessChallenge}
          onSelect={setSelectedPasswordlessChallenge}
          availableChallenges={availablePasswordlessChallenges}
        />
      )}
    </>
  );
}
