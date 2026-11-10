import { api } from "../lib/axios";

export const carritoService = {
  sincronizar: async (
    detalles: {
      productoId: number;
      cantidad: number;
      precioUnitario: number;
    }[],
  ) => {
    const respuesta = await api.post("/carrito/sincronizar", { detalles });
    return respuesta.data;
  },

  vaciar: async () => {
    const respuesta = await api.delete("/carrito");
    return respuesta.data;
  },
};
