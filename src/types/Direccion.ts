// ======================================================
// ENTIDAD PRINCIPAL (Basada en el schema de Prisma)
// ======================================================

export interface Direccion {
  id: number;
  clienteId: number;
  calle: string;
  numero: string;
  referencia?: string | null;
  ciudad: string;
  codigoPostal: string;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

export interface DireccionCreacionDTO {
  calle: string;
  numero: string;
  referencia?: string | null;
  ciudad: string;
  codigoPostal: string;
}

export interface DireccionActualizacionDTO {
  calle?: string;
  numero?: string;
  referencia?: string | null;
  ciudad?: string;
  codigoPostal?: string;
  activa?: boolean;
}
