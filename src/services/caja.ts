import { api } from "../lib/axios";

export const cajaService = {
  create: async (datos: { montoInicial: number }) => {
    const respuesta = await api.post("/cajas", datos);
    return respuesta.data;
  },

  getActiva: async () => {
    const respuesta = await api.get("/cajas/activa");
    return respuesta.data;
  },

  getAll: async () => {
    const respuesta = await api.get("/cajas");
    return respuesta.data;
  },

  getConciliacion: async (id: number) => {
    const respuesta = await api.get(`/cajas/${id}/conciliacion`);
    return respuesta.data;
  },

  cerrar: async (id: number, montoContado: number) => {
    const respuesta = await api.patch(`/cajas/${id}/cerrar`, { montoContado });
    return respuesta.data;
  },

  getHistorial: async () => {
    const respuesta = await api.get("/cajas/historial");
    return respuesta.data;
  },
};
