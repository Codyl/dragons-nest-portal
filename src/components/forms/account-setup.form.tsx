import { useForm, type ReactFormExtendedApi } from '@tanstack/react-form';
import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { z } from 'zod';

export type AccountSetupFormValues = {
  name: string;
  age: string;
  avatar: string;
  interests: string[];
  shortTermGoal: string;
  longTermGoal: string;
  learningStyles: string[];
};

/** Validator generics are widened so Zod `validators.onSubmit` matches the context type. */
/* eslint-disable @typescript-eslint/no-explicit-any */
type AccountSetupFormInstance = ReactFormExtendedApi<
  AccountSetupFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type AccountSetupFormContextValue = {
  form: AccountSetupFormInstance;
  stepIndex: number;
};

const AccountSetupFormContext = createContext<
  AccountSetupFormContextValue | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components -- hook used by step components outside this module
export function useAccountSetupForm() {
  const ctx = useContext(AccountSetupFormContext);
  if (!ctx) {
    throw new Error(
      'useAccountSetupForm must be used within AccountSetupForm',
    );
  }

  return ctx;
}

const accountSetupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z
    .string()
    .min(1, 'Age is required')
    .refine((v) => /^\d+$/.test(v) && Number(v) > 0, {
      message: 'Enter a valid age',
    }),
  avatar: z.string().min(1, 'Choose an avatar'),
  interests: z.array(z.string()).min(1, 'Select at least one topic'),
  shortTermGoal: z.string(),
  longTermGoal: z.string(),
  learningStyles: z.array(z.string()),
});

const AccountSetupForm = ({
  children,
  stepIndex,
}: {
  children: ReactNode;
  stepIndex: number;
}) => {
  const form = useForm({
    defaultValues: {
      name: '',
      age: '',
      avatar: '',
      interests: [] as string[],
      shortTermGoal: '',
      longTermGoal: '',
      learningStyles: [] as string[],
    },
    validators: {
      onSubmit: accountSetupSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <AccountSetupFormContext.Provider value={{ form, stepIndex }}>
      <form
        className="min-h-0"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {children}
      </form>
    </AccountSetupFormContext.Provider>
  );
};

export default AccountSetupForm;
