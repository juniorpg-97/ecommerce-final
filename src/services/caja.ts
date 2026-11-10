import { api } from "../lib/axios";
import type { Caja, CajaAperturaDTO, CajaCierreDTO } from "../types/Caja";

interface CajaApi {
  id: number;
  usuarioId: number;
  fechaApertura: string;
  fechaCierre: string | null;
  montoInicial: number | string;
  montoEsperado: number | string | null;
  montoContado: number | string | null;
  diferencia: number | string | null;
  estado: "ABIERTA" | "CERRADA";
  creadoEn: string;
  actualizadoEn: string;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

const convertirCaja = (caja: CajaApi): Caja => ({
  id: caja.id,
  usuarioId: caja.usuarioId,
  fechaApertura: caja.fechaApertura,
  fechaCierre: caja.fechaCierre,
  montoInicial: Number(caja.montoInicial),
  montoEsperado:
    caja.montoEsperado !== null ? Number(caja.montoEsperado) : null,
  montoContado: caja.montoContado !== null ? Number(caja.montoContado) : null,
  diferencia: caja.diferencia !== null ? Number(caja.diferencia) : null,
  estado: caja.estado,
  creadoEn: caja.creadoEn,
  actualizadoEn: caja.actualizadoEn,
});

export const cajaService = {
  abrirCaja: async (datos: CajaAperturaDTO): Promise<Caja> => {
    const respuesta = await api.post<CajaApi>("/caja/abrir", datos);
    return convertirCaja(respuesta.data);
  },

  cerrarCaja: async (cajaId: number, datos: CajaCierreDTO): Promise<Caja> => {
    const respuesta = await api.patch<CajaApi>(`/caja/${cajaId}/cerrar`, datos);
    return convertirCaja(respuesta.data);
  },

  obtenerCajaActiva: async (usuarioId: number): Promise<Caja | null> => {
    try {
      const respuesta = await api.get<CajaApi>(`/caja/activa/${usuarioId}`);
      return convertirCaja(respuesta.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getAll: async (
    fechaInicio?: string,
    fechaFin?: string,
    usuarioId?: number,
  ): Promise<Caja[]> => {
    const params: Record<string, string | number> = {};

    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (usuarioId) params.usuarioId = usuarioId;

    const respuesta = await api.get<CajaApi[]>("/caja", { params });
    return respuesta.data.map(convertirCaja);
  },

  getById: async (id: number): Promise<Caja> => {
    const respuesta = await api.get<CajaApi>(`/caja/${id}`);
    return convertirCaja(respuesta.data);
  },

  getPagina: async (
    pagina: number,
    porPagina: number,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<{ cajas: Caja[]; hayMas: boolean }> => {
    const params: Record<string, string | number> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const respuesta = await api.get<CajaApi[]>("/caja", { params });
    const cajasMapeadas = respuesta.data.map(convertirCaja);

    return {
      cajas: cajasMapeadas.slice(0, porPagina),
      hayMas: cajasMapeadas.length > porPagina,
    };
  },
};
