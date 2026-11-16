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

export interface ClienteActualizacionDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  activo?: boolean;
}
