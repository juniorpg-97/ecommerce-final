import { api } from "../lib/axios";
import type {
  DetalleCarritoConProducto,
  AgregarAlCarritoDTO,
  ActualizarCantidadDTO,
} from "../types/Carrito";

interface ProductoResumenApi {
  id: number;
  nombre: string;
  imagenUrl: string | null;
}

interface DetalleCarritoApi {
  id: number;
  carritoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  creadoEn: string;
  actualizadoEn: string;
  producto: ProductoResumenApi;
}

interface CarritoConDetallesApi {
  id: number;
  clienteId: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  detalles: DetalleCarritoApi[];
}

const convertirDetalleCarrito = (
  detalle: DetalleCarritoApi,
): DetalleCarritoConProducto => ({
  id: detalle.id,
  carritoId: detalle.carritoId,
  productoId: detalle.productoId,
  cantidad: detalle.cantidad,
  precioUnitario: Number(detalle.precioUnitario),
  creadoEn: detalle.creadoEn,
  actualizadoEn: detalle.actualizadoEn,
  producto: {
    id: detalle.producto.id,
    nombre: detalle.producto.nombre,
    imagenUrl: detalle.producto.imagenUrl,
  },
});

export const carritoService = {
  obtenerCarrito: async (
    clienteId: number,
  ): Promise<DetalleCarritoConProducto[]> => {
    const respuesta = await api.get<CarritoConDetallesApi>(
      `/carrito/${clienteId}`,
    );
    return respuesta.data.detalles.map(convertirDetalleCarrito);
  },

  agregarProducto: async (
    clienteId: number,
    datos: AgregarAlCarritoDTO,
  ): Promise<DetalleCarritoConProducto[]> => {
    const respuesta = await api.post<CarritoConDetallesApi>(
      `/carrito/${clienteId}/items`,
      datos,
    );
    return respuesta.data.detalles.map(convertirDetalleCarrito);
  },

  actualizarCantidad: async (
    clienteId: number,
    detalleId: number,
    datos: ActualizarCantidadDTO,
  ): Promise<DetalleCarritoConProducto[]> => {
    const respuesta = await api.patch<CarritoConDetallesApi>(
      `/carrito/${clienteId}/items/${detalleId}`,
      datos,
    );
    return respuesta.data.detalles.map(convertirDetalleCarrito);
  },

  eliminarProducto: async (
    clienteId: number,
    detalleId: number,
  ): Promise<DetalleCarritoConProducto[]> => {
    const respuesta = await api.delete<CarritoConDetallesApi>(
      `/carrito/${clienteId}/items/${detalleId}`,
    );
    return respuesta.data.detalles.map(convertirDetalleCarrito);
  },

  vaciarCarrito: async (clienteId: number): Promise<void> => {
    await api.delete(`/carrito/${clienteId}/vaciar`);
  },
};
