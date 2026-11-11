import type { Categoria } from "./Categoria";
export type EstadoProducto = "ACTIVO" | "INACTIVO";

// ======================================================
// ENTIDADES PRINCIPALES (Basadas en el schema de Prisma)
// ======================================================

export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  costoAdquisicion: number;
  imagen?: string | null; // ✅ Campo de imagen que viene del backend
  precioVenta: number;
  activo: boolean;
  imagenUrl?: string | null; // ✅ Único campo adicional para el frontend
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

// ======================================================
// TIPOS COMPUESTOS (Para respuestas del backend con include)
// ======================================================

// Cuando el backend hace: prisma.producto.findMany({ include: { categoria: true, inventario: true } })
export interface ProductoConDetalles extends Producto {
  categoria: Categoria;
  inventario: Inventario | null;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

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
  motivo?: string; // Ej: "Ajuste por inventario físico", "Merma"
}
