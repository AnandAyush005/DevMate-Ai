import api from "@/lib/api";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = AuthCredentials & {
  name: string;
};

export const getAuthMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const login = async (data: AuthCredentials) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterCredentials) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const logout = async ()=>{
  const response = await api.post("/auth/logout");
  return response.data;
}

export const requestPasswordReset = async (data: { email: string }) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const getPasswordReset = async (token: string) => {
  const response = await api.get(`/auth/reset-password/${token}`);
  return response.data;
};

export const resetPassword = async (data: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const { token, ...body } = data;
  const response = await api.post(`/auth/reset-password/${token}`, body);
  return response.data;
};