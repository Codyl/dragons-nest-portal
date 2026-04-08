import { useForm, type ReactFormExtendedApi } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { z } from 'zod';

import UserServices from '@/api/services/user.services';
import { ACCOUNT_SETUP_SESSION_KEY } from '@/constants/account-setup-session';
import { AVATAR_OPTIONS } from '@/utils/constants/account-setup.constants';
import { readSignupAccountTypeFromSession } from '@/utils/constants/signup.constants';
import { newStudentRow } from '@/components/forms/signup-add-students.step';
import {
  newCourseRow,
  type TeachableCourseDraft,
} from '@/components/steps/account-setup-teachable-step';

export type AccountSetupFormValues = {
  accountType: 'adult' | 'student';
  name: string;
  age: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  avatar: string;
  interests: string[];
  shortTermGoal: string;
  longTermGoal: string;
  learningStyles: string[];
  pendingStudents: ReturnType<typeof newStudentRow>[];
  teachableCourses: TeachableCourseDraft[];
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
  totalSteps: number;
  submitOnboarding: () => Promise<void>;
};

const AccountSetupFormContext = createContext<
  AccountSetupFormContextValue | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components -- hook used by step components outside this module
export function useAccountSetupForm() {
  const ctx = useContext(AccountSetupFormContext);
  if (!ctx) {
    throw new Error('useAccountSetupForm must be used within AccountSetupForm');
  }

  return ctx;
}

function mapAvatarToEmoji(avatarId: string): string {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found?.emoji ?? avatarId;
}

function normalizeUsPhoneToE164(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return raw.trim().startsWith('+') ? raw.trim() : `+${digits}`;
}

const accountSetupSchema = z
  .object({
    accountType: z.enum(['adult', 'student']),
    name: z.string().min(1, 'Name is required'),
    age: z
      .string()
      .min(1, 'Age is required')
      .refine((v) => /^\d+$/.test(v) && Number(v) > 0, {
        message: 'Enter a valid age',
      }),
    state: z.string().min(1, 'Select your state'),
    zipCode: z
      .string()
      .min(1, 'ZIP code is required')
      .regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    avatar: z.string().min(1, 'Choose an avatar'),
    interests: z.array(z.string()),
    shortTermGoal: z.string(),
    longTermGoal: z.string(),
    learningStyles: z.array(z.string()),
    pendingStudents: z.array(
      z.object({
        id: z.string(),
        displayName: z.string(),
        age: z.string(),
      }),
    ),
    teachableCourses: z.array(
      z.object({
        id: z.string(),
        subjectId: z.string(),
        grade: z.string(),
        curriculum: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const digits = data.phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid US phone number',
        path: ['phoneNumber'],
      });
    }
    if (data.accountType === 'student') {
      if (data.interests.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select at least one subject',
          path: ['interests'],
        });
      }
    } else {
      const validStudents = data.pendingStudents.every((s) => {
        const n = Number.parseInt(s.age, 10);
        return (
          s.displayName.trim().length > 0 &&
          Number.isFinite(n) &&
          n >= 1 &&
          n <= 120
        );
      });
      if (!validStudents || data.pendingStudents.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one student with name and age',
          path: ['pendingStudents'],
        });
      }
      const coursesOk = data.teachableCourses.every(
        (c) =>
          c.subjectId.trim().length > 0 &&
          c.grade.trim().length > 0 &&
          c.curriculum.trim().length > 0,
      );
      if (!coursesOk || data.teachableCourses.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one complete course row',
          path: ['teachableCourses'],
        });
      }
    }
  });

const AccountSetupForm = ({
  children,
  stepIndex,
  totalSteps,
}: {
  children: ReactNode;
  stepIndex: number;
  totalSteps: number;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const accountType =
    typeof window !== 'undefined'
      ? readSignupAccountTypeFromSession()
      : 'student';

  const form = useForm({
    defaultValues: {
      accountType,
      name: '',
      age: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      avatar: '',
      interests: [] as string[],
      shortTermGoal: '',
      longTermGoal: '',
      learningStyles: [] as string[],
      pendingStudents: [newStudentRow()],
      teachableCourses: [newCourseRow()] as TeachableCourseDraft[],
    } as AccountSetupFormValues,
    validators: {
      onSubmit: accountSetupSchema,
    },
    onSubmit: async ({ value }) => {
      const phoneE164 = normalizeUsPhoneToE164(value.phoneNumber);
      const avatarEmoji = mapAvatarToEmoji(value.avatar);

      await UserServices.submitAccountSetup({
        name: value.name,
        age: Number(value.age),
        avatar: avatarEmoji,
        interests: value.interests,
        shortTermGoal: value.shortTermGoal,
        longTermGoal: value.longTermGoal,
        learningStyles: value.learningStyles,
        accountType: value.accountType,
        state: value.state,
        zipCode: value.zipCode,
        phoneNumber: phoneE164,
        pendingStudents:
          value.accountType === 'adult'
            ? value.pendingStudents.map((s) => ({
                displayName: s.displayName.trim(),
                age: Number.parseInt(s.age, 10),
              }))
            : undefined,
        teachableCourses:
          value.accountType === 'adult'
            ? value.teachableCourses.map((c) => ({
                subjectId: c.subjectId,
                grade: c.grade,
                curriculum: c.curriculum,
              }))
            : undefined,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ACCOUNT_SETUP_SESSION_KEY, '1');
      }

      await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      await router.navigate({ to: '/welcome', replace: true });
    },
  });

  useEffect(() => {
    form.setFieldValue('accountType', readSignupAccountTypeFromSession());
    // form instance is stable for the lifetime of the provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitOnboarding = async () => {
    await form.handleSubmit();
  };

  return (
    <AccountSetupFormContext.Provider
      value={{ form, stepIndex, totalSteps, submitOnboarding }}
    >
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
