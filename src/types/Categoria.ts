export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CategoriaCreacionDTO {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaActualizacionDTO {
  nombre?: string;
  descripcion?: string | null;
  activa?: boolean;
}
