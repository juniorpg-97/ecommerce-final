// ======================================================
// ENTIDAD PRINCIPAL (Basada en el schema de Prisma)
// ======================================================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Para crear una nueva categoría
export interface CategoriaCreacionDTO {
  nombre: string;
  descripcion?: string | null;
}

// Para actualizar una categoría existente (todos opcionales para PATCH)
export interface CategoriaActualizacionDTO {
  nombre?: string;
  descripcion?: string | null;
  activa?: boolean;
}
