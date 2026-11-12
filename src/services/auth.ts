import { api } from "../lib/axios";
import type { LoginDTO, RegistroDTO, LoginRespuesta } from "../types/auth";

export const authService = {
  login: async (datos: LoginDTO): Promise<LoginRespuesta> => {
    const respuesta = await api.post<LoginRespuesta>("/auth/login", datos);
    return respuesta.data;
  },

  // ✅ ESTA ES LA CLAVE: Debe apuntar a /auth/register-cliente
  register: async (datos: RegistroDTO) => {
    const respuesta = await api.post("/auth/register-cliente", datos);
    return respuesta.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },
};
