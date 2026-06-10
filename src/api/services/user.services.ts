import type { AccountType } from '@/lib/user-account.schema';
import { api } from '../api.config';

export interface User {
  _id: string;
  availability?: {
    day: string;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
  cognitoSub?: string | null;
  linkedProviders?: string[];
  linkedProviderSubjects?: { GOOGLE?: string };
  hasPassword?: boolean;
  email?: string | null;
  deleted?: boolean;
  accountType?: AccountType | null;
  givenName?: string | null;
  familyName?: string | null;
  coppaConsentAt?: Date | null;
  firstLoggedInAt?: Date | null;
  birthDate?: Date | null;
  avatar?: string | null;
  interests?: string[];
  shortTermGoal?: string | null;
  longTermGoal?: string | null;
  learningStyles?: string[];
  onboardingCompletedAt?: Date | null;
  state?: string | null;
  zipCode?: string | null;
  parentId?: string | null;
  canManageOthers?: boolean;
  linkedStudents?: string[];
  addedClasses?: unknown[];
  ageBandAtRegistration?: unknown | null;
  managedAccountsView?: {
    studentId: string;
    displayName: string;
    currentGrade: number;
    lastPromotionYear: number;
    archivedAt?: Date | null;
  }[];
  teachableCourses?: {
    _id?: string;
    className?: string;
    subjectId?: string;
    matchesAllGrades?: boolean;
    grades?: string[];
    curriculum?: string;
    maxStudents?: number;
  }[];
  notificationEvents?: {
    type: 'COURSE_REMOVED';
    recipientUserId: string;
    payload: unknown;
    createdAt: Date;
  }[];
}

const UserServices = {
  getUsers: async ({
    state,
    grade,
    subjectId,
  }: {
    state: string;
    grade: string;
    subjectId: string;
  }): Promise<{
    message: string;
    data: User[];
  }> => {
    const response = await api.get(
      `users?state=${state}&grade=${grade}&subjectId=${subjectId}`,
    );
    return response.json();
  },
};

export default UserServices;
