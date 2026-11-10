import { api } from "../lib/axios";
import type {
  ProductoConDetalles,
  ProductoCreacionDTO,
  ProductoActualizacionDTO,
} from "../types/Producto";

interface ProductoApi {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion: string | null;
  costoAdquisicion: number | string;
  precioVenta: number | string;
  activo: boolean;
  imagenUrl: string | null;
  creadoEn: string;
  actualizadoEn: string;
  categoria?: {
    id: number;
    nombre: string;
    activa: boolean;
    creadoEn: string;
    actualizadoEn: string;
  };
  inventario?: {
    id: number;
    stock: number;
    creadoEn: string;
    actualizadoEn: string;
  } | null;
}

interface ProductoApiUpdate {
  nombre?: string;
  categoriaId?: number;
  descripcion?: string | null;
  costoAdquisicion?: number;
  precioVenta?: number;
  activo?: boolean;
  imagenUrl?: string | null;
}

const convertirProducto = (producto: ProductoApi): ProductoConDetalles => ({
  id: producto.id,
  categoriaId: producto.categoriaId,
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  costoAdquisicion: Number(producto.costoAdquisicion),
  precioVenta: Number(producto.precioVenta),
  activo: producto.activo,
  imagenUrl: producto.imagenUrl,
  creadoEn: producto.creadoEn,
  actualizadoEn: producto.actualizadoEn,

  categoria: producto.categoria ?? {
    id: 0,
    nombre: "Sin categoría",
    activa: true,
    creadoEn: "",
    actualizadoEn: "",
  },

  inventario: producto.inventario
    ? {
        id: producto.inventario.id,
        productoId: producto.id,
        stock: producto.inventario.stock,
        creadoEn: producto.inventario.creadoEn,
        actualizadoEn: producto.inventario.actualizadoEn,
      }
    : null,
});

const convertirDatosUpdate = (
  datos: ProductoActualizacionDTO,
): ProductoApiUpdate => ({
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.categoriaId !== undefined && { categoriaId: datos.categoriaId }),
  ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
  ...(datos.costoAdquisicion !== undefined && {
    costoAdquisicion: datos.costoAdquisicion,
  }),
  ...(datos.precioVenta !== undefined && { precioVenta: datos.precioVenta }),
  ...(datos.activo !== undefined && { activo: datos.activo }),
  ...(datos.imagenUrl !== undefined && { imagenUrl: datos.imagenUrl }),
});

export const productoService = {
  getAll: async (categoriaId?: number): Promise<ProductoConDetalles[]> => {
    const respuesta = await api.get<ProductoApi[]>("/productos", {
      params: categoriaId ? { categoriaId } : {},
    });
    return respuesta.data.map(convertirProducto);
  },

  getPagina: async (
    pagina: number,
    porPagina: number,
    categoriaId?: number,
  ): Promise<{ productos: ProductoConDetalles[]; hayMas: boolean }> => {
    const params: Record<string, string | number> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (categoriaId) {
      params.categoriaId = categoriaId;
    }

    const respuesta = await api.get<ProductoApi[]>("/productos", { params });
    const productosMapeados = respuesta.data.map(convertirProducto);

    return {
      productos: productosMapeados.slice(0, porPagina),
      hayMas: productosMapeados.length > porPagina,
    };
  },

  create: async (datos: ProductoCreacionDTO): Promise<ProductoConDetalles> => {
    const respuesta = await api.post<ProductoApi>("/productos", datos);
    return convertirProducto(respuesta.data);
  },

  update: async (
    id: number,
    datos: ProductoActualizacionDTO,
  ): Promise<ProductoConDetalles> => {
    const respuesta = await api.patch<ProductoApi>(
      `/productos/${id}`,
      convertirDatosUpdate(datos),
    );
    return convertirProducto(respuesta.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
};
