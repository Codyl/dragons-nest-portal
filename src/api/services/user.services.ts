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
};

export default UserServices;
