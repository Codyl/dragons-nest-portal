import { useForm, type ReactFormExtendedApi } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { z } from 'zod';

import UserServices from '@/api/services/user.services';
import { ACCOUNT_SETUP_SESSION_KEY } from '@/constants/account-setup-session';
import type { ExpectedBirthBand } from '@/lib/account-setup-flow';
import { AVATAR_OPTIONS } from '@/utils/constants/account-setup.constants';
import { newStudentRow } from '@/lib/pending-student-draft';
import {
  draftGradesToApiPayload,
  newCourseRow,
  teachableCoursesFormIsSubmittable,
  type TeachableCourseDraft,
} from '@/lib/teachable-course-validation';

export type AccountSetupFormValues = {
  accountType: 'adult' | 'student';
  name: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  avatar: string;
  interests: string[];
  shortTermGoal: string;
  longTermGoal: string;
  learningStyles: string[];
  adultAgeConfirmed: boolean;
  adultGuardianDutyConfirmed: boolean;
  teenAgeConfirmed: boolean;
  teenPermissionConfirmed: boolean;
  under13ChildConfirmed: boolean;
  under13GuardianPermissionConfirmed: boolean;
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
  expectedBirthBand: ExpectedBirthBand;
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

/** For optional UI (e.g. add-students) that only exists inside account setup when wrapped. */
// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalAccountSetupForm() {
  return useContext(AccountSetupFormContext);
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

function buildAccountSetupSchema(expectedBirthBand: ExpectedBirthBand) {
  return z
    .object({
      accountType: z.enum(['adult', 'student']),
      name: z.string().min(1, 'Name is required'),
      state: z.string().min(1, 'Select your state'),
      zipCode: z
        .string()
        .min(1, 'ZIP code is required')
        .regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),
      phoneNumber: z.string().min(1, 'Phone number is required'),
      avatar:
        expectedBirthBand === 'adult'
          ? z.string()
          : z.string().min(1, 'Choose an avatar'),
      interests: z.array(z.string()),
      shortTermGoal: z.string(),
      longTermGoal: z.string(),
      learningStyles: z.array(z.string()),
      adultAgeConfirmed: z.boolean(),
      adultGuardianDutyConfirmed: z.boolean(),
      teenAgeConfirmed: z.boolean(),
      teenPermissionConfirmed: z.boolean(),
      under13ChildConfirmed: z.boolean(),
      under13GuardianPermissionConfirmed: z.boolean(),
      pendingStudents: z.array(
        z.object({
          id: z.string(),
          studentDraftId: z.string(),
          displayName: z.string(),
          currentGradeOrdinal: z.string(),
        }),
      ),
      teachableCourses: z.array(
        z.object({
          id: z.string(),
          className: z.string(),
          subjectId: z.string(),
          grades: z.array(z.string()),
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

      if (expectedBirthBand === 'adult') {
        if (!data.adultAgeConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm that you are 18 or older',
            path: ['adultAgeConfirmed'],
          });
        }

        if (!data.adultGuardianDutyConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm guardian responsibility for this account',
            path: ['adultGuardianDutyConfirmed'],
          });
        }
      } else if (expectedBirthBand === 'teen13to17') {
        if (!data.teenAgeConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm that you are between 13 and 17',
            path: ['teenAgeConfirmed'],
          });
        }

        if (!data.teenPermissionConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm parent or guardian permission',
            path: ['teenPermissionConfirmed'],
          });
        }
      } else {
        if (!data.under13ChildConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm your age band for this account',
            path: ['under13ChildConfirmed'],
          });
        }

        if (!data.under13GuardianPermissionConfirmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Confirm you have guardian permission',
            path: ['under13GuardianPermissionConfirmed'],
          });
        }
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
          const g = Number.parseInt(s.currentGradeOrdinal, 10);
          return (
            s.displayName.trim().length > 0 &&
            Number.isFinite(g) &&
            g >= 0 &&
            g <= 13
          );
        });
        if (!validStudents || data.pendingStudents.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Add at least one student with name and grade',
            path: ['pendingStudents'],
          });
        }

        const coursesOk = teachableCoursesFormIsSubmittable(
          data.teachableCourses,
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
}

const AccountSetupForm = ({
  children,
  stepIndex,
  totalSteps,
  expectedBirthBand,
  initialFormAccountType,
}: {
  children: ReactNode;
  stepIndex: number;
  totalSteps: number;
  expectedBirthBand: ExpectedBirthBand;
  initialFormAccountType: 'adult' | 'student';
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const accountSetupSchema = useMemo(
    () => buildAccountSetupSchema(expectedBirthBand),
    [expectedBirthBand],
  );

  const form = useForm({
    defaultValues: {
      accountType: initialFormAccountType,
      name: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      avatar: '',
      interests: [] as string[],
      shortTermGoal: '',
      longTermGoal: '',
      learningStyles: [] as string[],
      adultAgeConfirmed: false,
      adultGuardianDutyConfirmed: false,
      teenAgeConfirmed: false,
      teenPermissionConfirmed: false,
      under13ChildConfirmed: false,
      under13GuardianPermissionConfirmed: false,
      pendingStudents: [newStudentRow()],
      teachableCourses: [newCourseRow()] as TeachableCourseDraft[],
    } as AccountSetupFormValues,
    validators: {
      onSubmit: accountSetupSchema,
    },
    onSubmit: async ({ value }) => {
      const phoneE164 = normalizeUsPhoneToE164(value.phoneNumber);
      const avatarId =
        value.avatar.trim().length > 0
          ? value.avatar
          : (AVATAR_OPTIONS[0]?.id ?? 'dragon');
      const avatarEmoji = mapAvatarToEmoji(avatarId);

      await UserServices.submitAccountSetup({
        name: value.name,
        onboardingExpectedBand: expectedBirthBand,
        adultAgeConfirmed: value.adultAgeConfirmed,
        adultGuardianDutyConfirmed: value.adultGuardianDutyConfirmed,
        teenAgeConfirmed: value.teenAgeConfirmed,
        teenPermissionConfirmed: value.teenPermissionConfirmed,
        under13ChildConfirmed: value.under13ChildConfirmed,
        under13GuardianPermissionConfirmed:
          value.under13GuardianPermissionConfirmed,
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
                studentDraftId: s.studentDraftId,
                displayName: s.displayName.trim(),
                currentGrade: Number.parseInt(s.currentGradeOrdinal, 10),
              }))
            : undefined,
        teachableCourses:
          value.accountType === 'adult'
            ? value.teachableCourses.map((c) => {
                const { matchesAllGrades, grades } = draftGradesToApiPayload(
                  c.grades,
                );
                return {
                  className: c.className.trim(),
                  subjectId: c.subjectId,
                  matchesAllGrades,
                  grades,
                  curriculum: c.curriculum,
                };
              })
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
    form.setFieldValue('accountType', initialFormAccountType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormAccountType]);

  const submitOnboarding = async () => {
    await form.handleSubmit();
  };

  return (
    <AccountSetupFormContext.Provider
      value={{
        form,
        stepIndex,
        totalSteps,
        submitOnboarding,
        expectedBirthBand,
      }}
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
