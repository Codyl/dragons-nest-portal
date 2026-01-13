import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../fields/input-field';
import { Button } from '../ui/button';

const LoginForm = () => {
  const { login } = useLoginMutation();

  const schema = z.object({
    email: z.email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },

    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className='flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0'
    >
      <form.Field
        name='email'
        children={(field) => <InputField field={field} label='Email' />}
      />
      <form.Field
        name='password'
        children={(field) => <InputField field={field} label='Password' />}
      />
      <Button type='submit'>Login</Button>
    </form>
  );
};

export default LoginForm;
