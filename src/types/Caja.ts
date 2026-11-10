export type EstadoCaja = "ABIERTA" | "CERRADA";

export interface Caja {
  id: number;
  usuarioId: number;
  fechaApertura: string;
  fechaCierre?: string | null;
  montoInicial: number;
  montoEsperado?: number | null;
  montoContado?: number | null;
  diferencia?: number | null;
  estado: EstadoCaja;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Lo que el cajero envía al abrir la caja al inicio del día
export interface CajaAperturaDTO {
  usuarioId: number;
  montoInicial: number; // El billete de cambio inicial
}

// Lo que el cajero envía al cerrar la caja al final del día
export interface CajaCierreDTO {
  montoContado: number; // Lo que físicamente contó en la caja
  observaciones?: string | null;
}
