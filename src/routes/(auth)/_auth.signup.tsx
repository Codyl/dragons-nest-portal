import { createFileRoute } from '@tanstack/react-router';
import CreateAccountForm from '@/components/forms/create-account.form';
import CommonCard from '@/components/cards/common-card';

export const Route = createFileRoute('/(auth)/_auth/signup')({
  head: () => ({
    meta: [
      { title: 'Create Account | Cody Lillywhite' },
      { name: 'description', content: 'Sign up for a new account.' },
    ],
  }),
  component: Signup,
});

function Signup() {
  return (
    <CommonCard
      title="Create Account"
      description="Enter your email below to create your account"
    >
      <CreateAccountForm />
    </CommonCard>
  );
}
