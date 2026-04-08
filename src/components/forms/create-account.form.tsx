import type { ComponentProps } from 'react';
import SignupAdultStudentForm from './signup-adult-student.form';

/**
 * Standalone student signup used in Storybook and Cypress.
 * The live `/signup` route uses SignupFlow instead.
 */
const CreateAccountForm = ({
  className,
  ...props
}: Omit<
  ComponentProps<typeof SignupAdultStudentForm>,
  'accountType' | 'submitButtonText'
> & {
  className?: string;
}) => {
  return (
    <SignupAdultStudentForm
      accountType="student"
      submitButtonText="Create Account"
      className={className}
      {...props}
    />
  );
};

export default CreateAccountForm;
