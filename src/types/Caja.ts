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

export interface CajaAperturaDTO {
  usuarioId: number;
  montoInicial: number;
}

export interface CajaCierreDTO {
  montoContado: number;
  observaciones?: string | null;
}
