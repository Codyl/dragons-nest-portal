import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordForm from "@/components/forms/forgot-password.form";
import CommonCard from "@/components/cards/common-card";
import useLoggedInUser from "@/hooks/use-logged-in-user";

export const Route = createFileRoute("/(auth)/_auth/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const user = useLoggedInUser();
  const userEmail = user.data?.data?.email || "";

  return (
    <CommonCard
      title="Forgot Password"
      description="Enter your email to receive a password recovery code"
    >
      <ForgotPasswordForm preFilledEmail={userEmail} />
    </CommonCard>
  );
}
