import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login.form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/_auth/login")({
  component: Login,
});

function Login() {
  const router = useRouter();

  const availableChallenges = sessionStorage.getItem("availableChallenges")?.split(",") || [];
  const availablePasswordlessChallenges = ["WEB_AUTHN", "EMAIL_OTP", "SMS_OTP"].filter(challenge => availableChallenges?.includes(challenge));
  const availablePasswordChallenges = availableChallenges.filter(challenge => !availablePasswordlessChallenges.includes(challenge));

  if (availableChallenges.length === 0) {
    router.navigate({ to: "/verify-username" });
  }

  return (
    <>
      {availablePasswordChallenges.length > 0 && (
        <Card className="w-full max-w-md">
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      )}
      {availablePasswordlessChallenges.length > 0 &&
        <div className="flex flex-col gap-2">
          {availablePasswordlessChallenges.map((challenge) => (
            <Button onClick={() => router.navigate({ to: `/mfa/${challenge.toLowerCase()}` })} variant="outline" key={challenge}>
              {challenge.toLocaleLowerCase().replace("_OTP", " Single Sign On")}
            </Button>
          ))}
        </div>
      }
    </>
  );
}
