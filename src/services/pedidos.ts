import { api } from "../lib/axios";
import type { CreatePedidoDTO, Pedido, EstadoPedido } from "../types/Pedido";

export const pedidoService = {
  create: async (datos: CreatePedidoDTO) => {
    const respuesta = await api.post("/pedidos", datos);
    return respuesta.data;
  },

  findAll: async (): Promise<Pedido[]> => {
    const respuesta = await api.get("/pedidos");
    return respuesta.data;
  },

  findPendientes: async (): Promise<Pedido[]> => {
    const respuesta = await api.get("/pedidos/pendientes");
    return respuesta.data;
  },

  cambiarEstado: async (id: number, estado: EstadoPedido) => {
    const respuesta = await api.patch(`/pedidos/${id}/estado`, { estado });
    return respuesta.data;
  },
  findMisPedidos: async (): Promise<Pedido[]> => {
    const respuesta = await api.get("/pedidos/mi-pedido");
    return respuesta.data;
  },
};
