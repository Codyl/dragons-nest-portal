import { createFileRoute } from '@tanstack/react-router';
import SignupFlow from '@/components/forms/signup-flow';

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
  return <SignupFlow />;
}
