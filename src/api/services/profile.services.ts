import { fetchAuthSession, fetchDevices } from 'aws-amplify/auth';
import { api } from '../api.config';

export type PasskeyListItem = {
  credentialId: string;
  displayName: string;
  provider: string;
  createdAt: string;
  /** Cognito does not expose last-used; null when unknown. */
  lastUsedAt: string | null;
};

export type HouseholdStudentProfile = {
  studentId: string;
  displayName: string;
  currentGrade: number;
  lastPromotionYear: number;
  archivedAt?: string | null;
};

/** Full list of drafts including archived rows (from `managedAccountsViewAll`). */
export type HouseholdStudentDraftAll = HouseholdStudentProfile;

export type TeachableCourseWithEnrollment = {
  className: string;
  subjectId: string;
  matchesAllGrades: boolean;
  grades: string[];
  curriculum: string;
  maxStudents: number;
  activeEnrollmentCount: number;
};

export type ProfileUserData = {
  _id?: string;
  email?: string;
  family_name?: string;
  middle_name?: string;
  given_name?: string;
  address?: { state?: string | null };
  phone_number?: string;
  emailMfaEnabled?: boolean;
  smsMfaEnabled?: boolean;
  softwareTokenMfaEnabled?: boolean;
  preferredMfa?: string;
  loginMethods?: string[];
  hasPassword?: boolean;
  hasPasskey?: boolean;
  passkeyCount?: number;
  firstLoggedInAt?: string | null;
  onboardingCompletedAt?: string | null;
  accountStatus?: 'MANAGED' | 'INDEPENDENT' | 'ADULT' | null;
  accountType?: string | null;
  ageBandAtRegistration?: string | null;
  householdStudents?: HouseholdStudentProfile[];
  managedAccountsViewAll?: HouseholdStudentDraftAll[];
  teachableCourses?: TeachableCourseWithEnrollment[];
};

export type KnownDevice = {
  DeviceKey: string;
  DeviceName: string;
  DeviceLastIPUsed: string;
  DeviceCreateDate: string;
  DeviceLastAuthenticatedDate: string;
  DeviceLastModifiedDate: string;
  City: string;
  Region: string;
  Country: string;
  isCurrentDevice: boolean;
};

export type StudentEnrolledClass = {
  subjectId: string | null;
  curriculumId: string | null;
  hoursCompleted: number;
  createdAt: string | null;
};

const ProfileServices = {
  getProfile: async (): Promise<{
    message: string;
    data: ProfileUserData;
  }> => {
    const response = await api.get('profile');
    return response.json();
  },
  recordFirstLogin: async (): Promise<{
    message: string;
    data: { firstLoggedInAt: string };
  }> => {
    const response = await api.post('profile/first-login', { json: {} });
    return response.json();
  },
  submitAccountSetup: async (json: {
    name: string;
    onboardingExpectedBand: 'adult' | 'teen13to17' | 'under13';
    adultAgeConfirmed?: boolean;
    adultGuardianDutyConfirmed?: boolean;
    teenAgeConfirmed?: boolean;
    teenPermissionConfirmed?: boolean;
    under13ChildConfirmed?: boolean;
    under13GuardianPermissionConfirmed?: boolean;
    avatar: string;
    interests: string[];
    shortTermGoal: string;
    longTermGoal: string;
    learningStyles: string[];
    accountType: 'adult' | 'student';
    state: string;
    zipCode: string;
    phoneNumber: string;
    weeklyAvailability: {
      day: string;
      slots: { start: string; end: string }[];
    }[];
    pendingStudents?: {
      studentId: string;
      displayName: string;
      currentGrade: number;
    }[];
    teachableCourses?: {
      className: string;
      subjectId: string;
      matchesAllGrades: boolean;
      grades: string[];
      curriculum: string;
      maxStudents: number;
    }[];
  }): Promise<{
    message: string;
    data: { onboardingCompletedAt: string };
  }> => {
    const response = await api.post('profile/account-setup', {
      json,
    });
    return response.json();
  },
  promoteHouseholdStudent: async (
    studentId: string,
  ): Promise<{
    message: string;
    data: HouseholdStudentProfile;
  }> => {
    const response = await api.patch(
      `profile/household-students/${encodeURIComponent(studentId)}/promote`,
      { json: {} },
    );
    return response.json();
  },
  updateUserSettings: async (json: {
    email?: string;
    family_name?: string;
    middle_name?: string;
    given_name?: string;
    phone_number?: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.put('profile/account', { json });
    return response.json();
  },
  changePassword: async (json: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/change-password', {
      json,
    });
    return response.json();
  },
  createPassword: async (json: {
    newPassword: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/create-password', {
      json,
    });
    return response.json();
  },
  setUserMFAPreference: async (json: {
    emailMfaEnabled?: boolean;
    smsMfaEnabled?: boolean;
    softwareTokenMfaEnabled?: boolean;
    preferredMfa?: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/mfa-preference', { json });
    return response.json();
  },
  deleteUser: async (json: {
    password?: string;
    mfaCode?: string;
    googleCredential?: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.delete('profile', { json });
    return response.json();
  },
  getKnownDevices: async (): Promise<{
    message: string;
    data: KnownDevice[];
  }> => {
    const amplifyDevices = await fetchDevices();
    const session = await fetchAuthSession();
    const deviceKey = session.tokens?.accessToken?.payload?.['device_key'];
    const currentDevice = amplifyDevices.find((d) => d.id === deviceKey);
    const response = await api.get('profile/known-devices');
    const data: {
      message: string;
      data: KnownDevice[];
    } = await response.json();
    return {
      message: data.message,
      data: data.data.map((d) => ({
        ...d,
        isCurrentDevice: d.DeviceKey === currentDevice?.id,
      })),
    };
  },
  rememberDevice: async (json: {
    deviceKey: string;
    shouldRememberDevice: boolean;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/remember-device', { json });
    return response.json();
  },
  forgetDevice: async (json: {
    deviceKey: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/forget-device', { json });
    return response.json();
  },
  linkGoogle: async (json: {
    credential: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('profile/link-google', { json });
    return response.json();
  },
  unlinkGoogle: async (): Promise<{
    message: string;
    data: { code?: string };
  }> => {
    const response = await api.post('profile/unlink-google', { json: {} });
    return response.json();
  },
  getWebAuthnRegistrationOptions: async (): Promise<{
    message: string;
    data: { credentialCreationOptions: Record<string, unknown> };
  }> => {
    const response = await api.post('profile/webauthn/register/begin', {
      json: {},
    });
    return response.json();
  },
  completeWebAuthnRegistration: async (
    credential: Record<string, unknown>,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const res = await api.post('profile/webauthn/register/complete', {
      json: { credential },
    });
    return res.json();
  },
  listPasskeys: async (): Promise<{
    message: string;
    data: { passkeys: PasskeyListItem[] };
  }> => {
    const response = await api.get('profile/webauthn/credentials');
    return response.json();
  },
  deletePasskey: async (
    credentialId: string,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const response = await api.delete('profile/webauthn/credentials', {
      json: { credentialId },
    });
    return response.json();
  },
  addTeachableCourse: async (json: {
    className: string;
    subjectId: string;
    matchesAllGrades: boolean;
    grades: string[];
    curriculum: string;
    maxStudents: number;
  }): Promise<{
    message: string;
    data: { teachableCourses: TeachableCourseWithEnrollment[] };
  }> => {
    const response = await api.patch('profile/teachable-courses', { json });
    return response.json();
  },
  removeTeachableCourse: async (
    index: number,
  ): Promise<{
    message: string;
    data: { teachableCourses: TeachableCourseWithEnrollment[] };
  }> => {
    const response = await api.delete(`profile/teachable-courses/${index}`);
    return response.json();
  },
  addHouseholdStudent: async (json: {
    displayName: string;
    currentGrade: number;
  }): Promise<{
    message: string;
    data: { managedAccountsView: HouseholdStudentDraftAll[] };
  }> => {
    const response = await api.post('profile/household-students', { json });
    return response.json();
  },
  archiveHouseholdStudent: async (
    studentId: string,
  ): Promise<{
    message: string;
    data: { managedAccountsView: HouseholdStudentDraftAll[] };
  }> => {
    const response = await api.patch(
      `profile/household-students/${encodeURIComponent(studentId)}/archive`,
      { json: {} },
    );
    return response.json();
  },
  restoreHouseholdStudent: async (
    studentId: string,
  ): Promise<{
    message: string;
    data: { managedAccountsView: HouseholdStudentDraftAll[] };
  }> => {
    const response = await api.patch(
      `profile/household-students/${encodeURIComponent(studentId)}/restore`,
      { json: {} },
    );
    return response.json();
  },
  getStudentClasses: async (
    studentId: string,
  ): Promise<{
    message: string;
    data: StudentEnrolledClass[];
  }> => {
    const response = await api.get(
      `profile/household-students/${encodeURIComponent(studentId)}/classes`,
    );
    return response.json();
  },
};

export default ProfileServices;
