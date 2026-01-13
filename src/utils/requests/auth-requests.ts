import ky from 'ky';
const login = async (json: { email: string; password: string }) => {
  const response = await ky.post('/api/auth/login', {
    json,
  });
  return response.json();
};

const register = async (json: { email: string; password: string }) => {
  const response = await ky.post('/api/auth/register', {
    json,
  });
  return response.json();
};

const logout = async () => {
  const response = await ky.post('/api/auth/logout');
  return response.json();
};

const getUser = async () => {
  const response = await ky.get('/api/auth/user');
  return response.json();
};

const mfa

export { login, register, logout, getUser };
