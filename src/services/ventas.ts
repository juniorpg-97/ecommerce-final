import { api } from "../lib/axios";
import type {
  CreateVentaDTO,
  VentaRespuesta,
  VentaHistorial,
} from "../types/Venta";

export const ventaService = {
  create: async (datos: CreateVentaDTO): Promise<VentaRespuesta> => {
    const respuesta = await api.post<VentaRespuesta>("/ventas", datos);
    return respuesta.data;
  },

  findAll: async (
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<VentaHistorial[]> => {
    const params: Record<string, string> = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const respuesta = await api.get<VentaHistorial[]>("/ventas", { params });
    return respuesta.data;
  },
};
