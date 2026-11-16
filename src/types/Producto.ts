import type { Categoria } from "./Categoria";
export type EstadoProducto = "ACTIVO" | "INACTIVO";

export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  costoAdquisicion: number;
  imagen?: string | null;
  precioVenta: number;
  activo: boolean;
  imagenUrl?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Inventario {
  id: number;
  productoId: number;
  stock: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ProductoConDetalles extends Producto {
  categoria: Categoria;
  inventario: Inventario | null;
}

export interface ProductoCreacionDTO {
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  costoAdquisicion: number;
  precioVenta: number;
  imagenUrl?: string | null;
}

export interface ProductoActualizacionDTO {
  categoriaId?: number;
  nombre?: string;
  descripcion?: string | null;
  costoAdquisicion?: number;
  precioVenta?: number;
  activo?: boolean;
  imagenUrl?: string | null;
}

export interface ActualizarStockDTO {
  stock: number;
  motivo?: string;
}
