import type { ComponentProps } from 'react';
import SignupAdultManagedUserForm from './signup-adult.form';

/**
 * Standalone manageduser signup used in Storybook and Cypress.
 * The live `/signup` route uses SignupFlow instead.
 */
const CreateAccountForm = ({
  className,
  ...props
}: Omit<
  ComponentProps<typeof SignupAdultManagedUserForm>,
  'accountType' | 'submitButtonText'
> & {
  className?: string;
}) => {
  return (
    <SignupAdultManagedUserForm
      accountType="manageduser"
      submitButtonText="Create Account"
      className={className}
      {...props}
    />
  );
};

export default CreateAccountForm;
