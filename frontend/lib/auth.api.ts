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