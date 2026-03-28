import { fetchAuthSession, fetchDevices } from 'aws-amplify/auth';
import { api } from '../api.config';

export type PasskeyListItem = {
  credentialId: string;
  displayName: string;
  provider: string;
  createdAt: string;
  lastUsedAt: string;
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

const UserServices = {
  getUser: async (): Promise<{
    message: string;
    data: {
      email?: string;
      family_name?: string;
      middle_name?: string;
      given_name?: string;
      phone_number?: string;
      emailMfaEnabled?: boolean;
      smsMfaEnabled?: boolean;
      softwareTokenMfaEnabled?: boolean;
      preferredMfa?: string;
      loginMethods?: string[];
      hasPassword?: boolean;
      hasPasskey?: boolean;
      passkeyCount?: number;
      first_logged_in_at?: string | null;
    };
  }> => {
    const response = await api.get('profile');
    return response.json();
  },
  recordFirstLogin: async (): Promise<{
    message: string;
    data: { first_logged_in_at: string };
  }> => {
    const response = await api.post('profile/first-login', { json: {} });
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
    password: string;
    mfaCode?: string;
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
  getPasskeyRegisterOptions: async (): Promise<{
    message: string;
    data: Record<string, unknown>;
  }> => {
    const response = await api.post('profile/passkey/register/options', {
      json: {},
    });
    return response.json();
  },
  verifyPasskeyRegistration: async (
    response: Record<string, unknown>,
  ): Promise<{
    message: string;
    data: { verified: boolean };
  }> => {
    const res = await api.post('profile/passkey/register/verify', {
      json: response,
    });
    return res.json();
  },
  listPasskeys: async (): Promise<{
    message: string;
    data: { passkeys: PasskeyListItem[] };
  }> => {
    const response = await api.get('profile/passkeys');
    return response.json();
  },
  deletePasskey: async (
    credentialId: string,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const response = await api.delete('profile/passkeys', {
      json: { credentialId },
    });
    return response.json();
  },
};

export default UserServices;
