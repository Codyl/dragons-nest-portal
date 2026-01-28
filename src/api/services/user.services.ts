import { api } from "../api.config";

const UserServices = {
  getUser: async () => {
    const response = await api.get("users/me");
    return response.json();
  },
  updateUserSettings: async (json: {
    email?: string;
    family_name?: string;
    middle_name?: string;
    given_name?: string;
    phone_number?: string;
  }) => {
    const response = await api.put("users/me/account", { json });
    return response.json();
  },
    changePassword: async (json: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("users/me/change-password", {
      json,
    });
    return response.json();
  },
  setUserMFAPreference: async (json: {
    emailMfaEnabled?: boolean;
    smsMfaEnabled?: boolean;
    softwareTokenMfaEnabled?: boolean;
    preferredMfa?: string;
  }) => {
    const response = await api.post("users/me/mfa-preference", { json });
    return response.json();
  },
    deleteUser: async (json: {
    password: string;
  }) => {
    const response = await api.delete("users/me", { json });
    return response.json();
  },
  getKnownDevices: async () => {
    const response = await api.get("users/me/known-devices");
    return response.json();
  },
  rememberDevice: async (json: {
    deviceKey: string;
    deviceGroupKey: string;
  }) => {
    const response = await api.post("users/me/remember-device", { json });
    return response.json();
  },
  forgetDevice: async (json: {
    deviceKey: string;
  }) => {
    const response = await api.post("users/me/forget-device", { json });
    return response.json();
  },
};

export default UserServices;
