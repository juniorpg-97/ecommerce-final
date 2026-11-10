import { api } from "../lib/axios";
import type { LoginDTO, RegistroDTO, LoginRespuesta } from "../types/auth";

export const authService = {
  login: async (datos: LoginDTO): Promise<LoginRespuesta> => {
    const respuesta = await api.post<LoginRespuesta>("/auth/login", datos);
    return respuesta.data;
  },

  register: async (datos: RegistroDTO) => {
    const respuesta = await api.post("/auth/register", datos);
    return respuesta.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },
};
