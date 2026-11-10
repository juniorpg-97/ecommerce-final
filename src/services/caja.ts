import { api } from "../lib/axios";

export const cajaService = {
  getActiva: async () => {
    const respuesta = await api.get("/cajas/activa");
    return respuesta.data;
  },
};
