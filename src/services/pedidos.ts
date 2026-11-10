import { api } from "../lib/axios";
import type {
  Pedido,
  DetallePedido,
  EstadoPedido,
  MetodoPago,
} from "../types/Pedido";

interface DetallePedidoApi {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  descuento: number | string;
  subtotal: number | string;
  creadoEn: string;
  actualizadoEn: string;
  producto: {
    id: number;
    nombre: string;
    imagenUrl: string | null;
  };
}

interface PedidoApi {
  id: number;
  clienteId: number;
  direccionId: number;
  estado:
    | "PENDIENTE"
    | "PAGADO"
    | "EN_PREPARACION"
    | "EN_CAMINO"
    | "ENTREGADO"
    | "CANCELADO";
  total: number | string;
  metodoPago: string;
  observaciones: string | null;
  creadoEn: string;
  actualizadoEn: string;
  detalles: DetallePedidoApi[];
  direccion?: {
    id: number;
    calle: string;
    numero: string;
    referencia: string | null;
    ciudad: string;
    codigoPostal: string;
  };
  pagos?: {
    id: number;
    metodo: string;
    estado: string;
    monto: number | string;
  }[];
}

interface PedidoApiUpdate {
  estado?:
    | "PENDIENTE"
    | "PAGADO"
    | "EN_PREPARACION"
    | "EN_CAMINO"
    | "ENTREGADO"
    | "CANCELADO";
  observaciones?: string | null;
}

const convertirDetallePedido = (detalle: DetallePedidoApi): DetallePedido => ({
  id: detalle.id,
  pedidoId: detalle.pedidoId,
  productoId: detalle.productoId,
  cantidad: detalle.cantidad,
  precioUnitario: Number(detalle.precioUnitario),
  descuento: Number(detalle.descuento),
  subtotal: Number(detalle.subtotal),
  creadoEn: detalle.creadoEn,
  actualizadoEn: detalle.actualizadoEn,
});

const convertirPedido = (pedido: PedidoApi): Pedido => ({
  id: pedido.id,
  clienteId: pedido.clienteId,
  direccionId: pedido.direccionId,
  estado: pedido.estado as EstadoPedido,
  total: Number(pedido.total),
  metodoPago: pedido.metodoPago as MetodoPago,
  observaciones: pedido.observaciones,
  creadoEn: pedido.creadoEn,
  actualizadoEn: pedido.actualizadoEn,
});

const convertirDatosUpdate = (datos: {
  estado?: EstadoPedido;
  observaciones?: string | null;
}): PedidoApiUpdate => ({
  ...(datos.estado !== undefined && { estado: datos.estado }),
  ...(datos.observaciones !== undefined && {
    observaciones: datos.observaciones,
  }),
});

export const pedidoService = {
  getAll: async (
    estado?: EstadoPedido,
    clienteId?: number,
  ): Promise<Pedido[]> => {
    const params: Record<string, string | number> = {};

    if (estado) params.estado = estado;
    if (clienteId) params.clienteId = clienteId;

    const respuesta = await api.get<PedidoApi[]>("/pedidos", { params });
    return respuesta.data.map(convertirPedido);
  },

  getPagina: async (
    pagina: number,
    porPagina: number,
    estado?: EstadoPedido,
  ): Promise<{ pedidos: Pedido[]; hayMas: boolean }> => {
    const params: Record<string, string | number> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (estado) params.estado = estado;

    const respuesta = await api.get<PedidoApi[]>("/pedidos", { params });
    const pedidosMapeados = respuesta.data.map(convertirPedido);

    return {
      pedidos: pedidosMapeados.slice(0, porPagina),
      hayMas: pedidosMapeados.length > porPagina,
    };
  },

  getById: async (
    id: number,
  ): Promise<Pedido & { detalles: DetallePedido[] }> => {
    const respuesta = await api.get<PedidoApi>(`/pedidos/${id}`);
    return {
      ...convertirPedido(respuesta.data),
      detalles: respuesta.data.detalles.map(convertirDetallePedido),
    };
  },

  getByCliente: async (clienteId: number): Promise<Pedido[]> => {
    const respuesta = await api.get<PedidoApi[]>(
      `/pedidos/cliente/${clienteId}`,
    );
    return respuesta.data.map(convertirPedido);
  },

  update: async (
    id: number,
    datos: { estado?: EstadoPedido; observaciones?: string | null },
  ): Promise<Pedido> => {
    const respuesta = await api.patch<PedidoApi>(
      `/pedidos/${id}`,
      convertirDatosUpdate(datos),
    );
    return convertirPedido(respuesta.data);
  },

  cancelar: async (id: number): Promise<Pedido> => {
    const respuesta = await api.patch<PedidoApi>(`/pedidos/${id}/cancelar`);
    return convertirPedido(respuesta.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pedidos/${id}`);
  },
};
