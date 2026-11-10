import { api } from "../lib/axios";
import type { Pago, IniciarPagoDTO } from "../types/Pago";

interface PagoApi {
  id: number;
  pedidoId: number | null;
  ventaId: number | null;
  metodo: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";
  monto: number | string;
  transaccionId: string | null;
  referencia: string | null;
  respuestaMockPay: string | null;
  fechaPago: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

interface ConfirmarPagoDTO {
  transaccionId: string;
  estado: "APROBADO" | "RECHAZADO";
  referencia: string;
  respuestaRaw?: string;
}

const convertirPago = (pago: PagoApi): Pago => ({
  id: pago.id,
  pedidoId: pago.pedidoId,
  ventaId: pago.ventaId,
  metodo: pago.metodo as Pago["metodo"],
  estado: pago.estado,
  monto: Number(pago.monto),
  transaccionId: pago.transaccionId,
  referencia: pago.referencia,
  respuestaMockPay: pago.respuestaMockPay,
  fechaPago: pago.fechaPago,
  creadoEn: pago.creadoEn,
  actualizadoEn: pago.actualizadoEn,
});

export const pagoService = {
  iniciar: async (datos: IniciarPagoDTO): Promise<Pago> => {
    const respuesta = await api.post<PagoApi>("/pagos", datos);
    return convertirPago(respuesta.data);
  },

  confirmar: async (pagoId: number, datos: ConfirmarPagoDTO): Promise<Pago> => {
    const respuesta = await api.patch<PagoApi>(
      `/pagos/${pagoId}/confirmar`,
      datos,
    );
    return convertirPago(respuesta.data);
  },

  obtenerPorVenta: async (ventaId: number): Promise<Pago[]> => {
    const respuesta = await api.get<PagoApi[]>(`/pagos/venta/${ventaId}`);
    return respuesta.data.map(convertirPago);
  },

  obtenerPorPedido: async (pedidoId: number): Promise<Pago[]> => {
    const respuesta = await api.get<PagoApi[]>(`/pagos/pedido/${pedidoId}`);
    return respuesta.data.map(convertirPago);
  },

  getAll: async (
    estado?: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<Pago[]> => {
    const params: Record<string, string> = {};

    if (estado) params.estado = estado;
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const respuesta = await api.get<PagoApi[]>("/pagos", { params });
    return respuesta.data.map(convertirPago);
  },
};
