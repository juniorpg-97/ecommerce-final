// ======================================================
// ENTIDADES PRINCIPALES (Basadas en el schema de Prisma)
// ======================================================

export interface Cliente {
  id: number;
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Para cuando el admin edita los datos de un cliente
export interface ClienteActualizacionDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  activo?: boolean;
}
