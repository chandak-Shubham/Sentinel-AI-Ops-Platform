import { api } from "@/services/api";

export const authService = {
  login: api.login,
  createUser: api.createUser
};
