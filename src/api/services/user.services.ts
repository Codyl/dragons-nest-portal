import { api } from '../api.config';

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
    };
  }> => {
    const response = await api.get('users/me');
    return response.json();
  },
  updateUserSettings: async (json: {
    email?: string;
    family_name?: string;
    middle_name?: string;
    given_name?: string;
    phone_number?: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.put('users/me/account', { json });
    return response.json();
  },
  changePassword: async (json: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('users/me/change-password', {
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
    const response = await api.post('users/me/mfa-preference', { json });
    return response.json();
  },
  deleteUser: async (json: {
    password: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.delete('users/me', { json });
    return response.json();
  },
  getKnownDevices: async (): Promise<{
    message: string;
    data: {
      DeviceKey: string;
      DeviceName: string;
      DeviceLastIPUsed: string;
      DeviceCreateDate: string;
      DeviceLastAuthenticatedDate: string;
      DeviceLastModifiedDate: string;
      City: string;
      Region: string;
      Country: string;
    }[];
  }> => {
    const response = await api.get('users/me/known-devices');
    return response.json();
  },
  rememberDevice: async (json: {
    deviceKey: string;
    shouldRememberDevice: boolean;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('users/me/remember-device', { json });
    return response.json();
  },
  forgetDevice: async (json: {
    deviceKey: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('users/me/forget-device', { json });
    return response.json();
  },
  linkGoogle: async (json: { credential: string }): Promise<{ message: string; data: {} }> => {
    const response = await api.post('users/me/link-google', { json });
    return response.json();
  },
  getPasskeyRegisterOptions: async (): Promise<{
    message: string;
    data: Record<string, unknown>;
  }> => {
    const response = await api.post('users/me/passkey/register/options', {
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
    const res = await api.post('users/me/passkey/register/verify', {
      json: response,
    });
    return res.json();
  },
};

export default UserServices;
