import { api } from "../api.config";

const UserServices = {
  getUser: async () => {
    const response = await api.get("users/me");
    return response.json();
  },
  updateUserSettings: async (json: {
    accessToken: string;
    email?: string;
    password?: string;
    address?: string;
    family_name?: string;
    middle_name?: string;
    given_name?: string;
  }) => {
    const response = await api.post("users/me/settings", { json });
    return response.json();
  },
};

export default UserServices;
