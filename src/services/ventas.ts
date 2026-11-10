import { api } from "../lib/axios";
import type {
  Venta,
  DetalleVenta,
  VentaConDetalles,
  CrearVentaPOSDTO,
} from "../types/Venta";

interface DetalleVentaApi {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string;
  creadoEn: string;
  actualizadoEn: string;
  producto: {
    id: number;
    nombre: string;
  };
}

interface VentaApi {
  id: number;
  pedidoId: number | null;
  cajaId: number | null;
  usuarioId: number;
  clienteId: number | null;
  tipo: "POS" | "REDES_SOCIALES" | "WEB";
  fecha: string;
  subtotalVenta: number | string;
  descuento: number | string;
  totalVenta: number | string;
  metodoPago: string;
  estado: "COMPLETADA" | "ANULADA";
  observaciones: string | null;
  creadoEn: string;
  actualizadoEn: string;
  detalles: DetalleVentaApi[];
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

const convertirDetalleVenta = (detalle: DetalleVentaApi): DetalleVenta => ({
  id: detalle.id,
  ventaId: detalle.ventaId,
  productoId: detalle.productoId,
  cantidad: detalle.cantidad,
  precioUnitario: Number(detalle.precioUnitario),
  subtotal: Number(detalle.subtotal),
  creadoEn: detalle.creadoEn,
  actualizadoEn: detalle.actualizadoEn,
});

const convertirVenta = (venta: VentaApi): VentaConDetalles => ({
  id: venta.id,
  pedidoId: venta.pedidoId,
  cajaId: venta.cajaId,
  usuarioId: venta.usuarioId,
  clienteId: venta.clienteId,
  tipo: venta.tipo,
  fecha: venta.fecha,
  subtotalVenta: Number(venta.subtotalVenta),
  descuento: Number(venta.descuento),
  totalVenta: Number(venta.totalVenta),
  metodoPago: venta.metodoPago as Venta["metodoPago"],
  estado: venta.estado,
  observaciones: venta.observaciones,
  creadoEn: venta.creadoEn,
  actualizadoEn: venta.actualizadoEn,
  detalles: venta.detalles.map(convertirDetalleVenta),
  usuario: venta.usuario,
  cliente: venta.cliente,
});

export const ventaService = {
  crearVentaPOS: async (datos: CrearVentaPOSDTO): Promise<VentaConDetalles> => {
    const respuesta = await api.post<VentaApi>("/ventas", datos);
    return convertirVenta(respuesta.data);
  },

  getAll: async (
    fechaInicio?: string,
    fechaFin?: string,
    usuarioId?: number,
  ): Promise<VentaConDetalles[]> => {
    const params: Record<string, string | number> = {};

    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (usuarioId) params.usuarioId = usuarioId;

    const respuesta = await api.get<VentaApi[]>("/ventas", { params });
    return respuesta.data.map(convertirVenta);
  },

  // C. Obtener una venta específica por ID
  getById: async (id: number): Promise<VentaConDetalles> => {
    const respuesta = await api.get<VentaApi>(`/ventas/${id}`);
    return convertirVenta(respuesta.data);
  },

  // D. Anular una venta (cambia el estado a "ANULADA" y devuelve el stock)
  anular: async (id: number): Promise<VentaConDetalles> => {
    const respuesta = await api.patch<VentaApi>(`/ventas/${id}/anular`);
    return convertirVenta(respuesta.data);
  },

  getPagina: async (
    pagina: number,
    porPagina: number,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<{ ventas: VentaConDetalles[]; hayMas: boolean }> => {
    const params: Record<string, string | number> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const respuesta = await api.get<VentaApi[]>("/ventas", { params });
    const ventasMapeadas = respuesta.data.map(convertirVenta);

    return {
      ventas: ventasMapeadas.slice(0, porPagina),
      hayMas: ventasMapeadas.length > porPagina,
    };
  },
};
