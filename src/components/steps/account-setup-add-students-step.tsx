import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import SignupAddStudentsStep, {
  newStudentRow,
} from '@/components/forms/signup-add-students.step';
import type { PendingStudentDraft } from '@/components/forms/signup-add-students.step';
import { Users } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';

const AccountSetupAddStudentsStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const { form } = useAccountSetupForm();

  return (
    <AccountSetupCard
      stepIcon={<Users className="mx-auto h-9 w-9" strokeWidth={1.5} />}
      title="Add your students"
      subtitle="Create a profile for each learner on your account. You can refine details later."
      footer={null}
    >
      <form.Field name="pendingStudents">
        {(field) => {
          const students = (field.state.value as
            | PendingStudentDraft[]
            | undefined) ?? [newStudentRow()];

          const setStudents = (next: PendingStudentDraft[]) => {
            field.handleChange(next);
          };

          const allValid = students.every((s) => {
            const g = Number.parseInt(s.currentGradeOrdinal, 10);
            return (
              s.displayName.trim().length > 0 &&
              Number.isFinite(g) &&
              g >= 0 &&
              g <= 13
            );
          });

          const tryContinue = async () => {
            if (!allValid) return;
            await form.validateField('pendingStudents', 'change');
            await form.validateField('adultGuardianDutyConfirmed', 'change');
            form.setFieldMeta('adultGuardianDutyConfirmed', (prev) => ({
              ...prev,
              isTouched: true,
            }));
            const guardianErrors =
              form.getFieldMeta('adultGuardianDutyConfirmed')?.errors?.length ??
              0;
            if (guardianErrors > 0) return;
            onNext();
          };

          return (
            <SignupAddStudentsStep
              students={students}
              onChange={setStudents}
              onFinish={tryContinue}
              onBack={onBack}
              isSubmitting={false}
              primaryActionLabel="Continue"
              hideHeader
              showAdultGuardianAttestation
            />
          );
        }}
      </form.Field>
    </AccountSetupCard>
  );
};

export default AccountSetupAddStudentsStep;
