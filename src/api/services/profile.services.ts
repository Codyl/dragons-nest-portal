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

export type ManagedUserProfile = {
  managedUserId: string;
  displayName: string;
  currentGrade: number;
  lastPromotionYear: number;
  archivedAt?: string | null;
};

/** Full list of drafts including archived rows (from `managedAccountsViewAll`). */
export type ManagedUserDraftAll = ManagedUserProfile;

export type TeachableSubjectWithEnrollment = {
  className: string; // ponytail: wire name kept for API compat; represents displayName
  subjectId: string;
  matchesAllGrades: boolean;
  grades: string[];
  curriculum: string;
  maxManagedUsers: number; // ponytail: wire name kept; represents maxManagedUsers
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
  managedUsers?: ManagedUserProfile[];
  managedAccountsViewAll?: ManagedUserDraftAll[];
  teachableCourses?: TeachableSubjectWithEnrollment[];
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

export type ManagedUserEnrolledSubject = {
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
    const raw = await response.json() as { message: string; data: any };
    // ponytail: normalize API wire names to glossary terms
    if (raw.data?.managedUsers) {
      raw.data.managedUsers = raw.data.managedUsers.map(
        (s: any) => ({ ...s, managedUserId: s.managedUserId ?? s.managedUserId }),
      );
    }
    if (raw.data?.managedAccountsViewAll) {
      raw.data.managedAccountsViewAll = raw.data.managedAccountsViewAll.map(
        (s: any) => ({ ...s, managedUserId: s.managedUserId ?? s.managedUserId }),
      );
    }
    return raw;
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
    accountType: 'adult' | 'manageduser';
    state: string;
    zipCode: string;
    phoneNumber: string;
    weeklyAvailability: {
      day: string;
      slots: { start: string; end: string }[];
    }[];
    pendingManagedUsers?: {
      managedUserId: string;
      displayName: string;
      currentGrade: number;
    }[];
    teachableCourses?: {
      className: string;
      subjectId: string;
      matchesAllGrades: boolean;
      grades: string[];
      curriculum: string;
      maxManagedUsers: number;
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
  promoteManagedUser: async (
    managedUserId: string,
  ): Promise<{
    message: string;
    data: ManagedUserProfile;
  }> => {
    const response = await api.patch(
      `profile/managed-users/${encodeURIComponent(managedUserId)}/promote`,
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
  addTeachableSubject: async (json: {
    className: string;
    subjectId: string;
    matchesAllGrades: boolean;
    grades: string[];
    curriculum: string;
    maxManagedUsers: number;
  }): Promise<{
    message: string;
    data: { teachableCourses: TeachableSubjectWithEnrollment[] };
  }> => {
    const response = await api.patch('profile/teachable-subjects', { json });
    return response.json();
  },
  removeTeachableSubject: async (
    index: number,
  ): Promise<{
    message: string;
    data: { teachableCourses: TeachableSubjectWithEnrollment[] };
  }> => {
    const response = await api.delete(`profile/teachable-subjects/${index}`);
    return response.json();
  },
  addManagedUser: async (json: {
    displayName: string;
    currentGrade: number;
  }): Promise<{
    message: string;
    data: { managedAccountsView: ManagedUserDraftAll[] };
  }> => {
    const response = await api.post('profile/managed-users', { json });
    return response.json();
  },
  archiveManagedUser: async (
    managedUserId: string,
  ): Promise<{
    message: string;
    data: { managedAccountsView: ManagedUserDraftAll[] };
  }> => {
    const response = await api.patch(
      `profile/managed-users/${encodeURIComponent(managedUserId)}/archive`,
      { json: {} },
    );
    return response.json();
  },
  restoreManagedUser: async (
    managedUserId: string,
  ): Promise<{
    message: string;
    data: { managedAccountsView: ManagedUserDraftAll[] };
  }> => {
    const response = await api.patch(
      `profile/managed-users/${encodeURIComponent(managedUserId)}/restore`,
      { json: {} },
    );
    return response.json();
  },
  getManagedUserSubjects: async (
    managedUserId: string,
  ): Promise<{
    message: string;
    data: ManagedUserEnrolledSubject[];
  }> => {
    const response = await api.get(
      `profile/managed-users/${encodeURIComponent(managedUserId)}/subjects`,
    );
    return response.json();
  },
  addSubjectToManagedUser: async (
    managedUserId: string,
    subjectId: string,
  ): Promise<{
    message: string;
    data: { subjectId: string; hoursCompleted: number; createdAt: string };
  }> => {
    const response = await api.post(
      `profile/managed-users/${encodeURIComponent(managedUserId)}/subjects`,
      { json: { subjectId } },
    );
    return response.json();
  },
};

export default ProfileServices;
