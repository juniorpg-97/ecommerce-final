import type { MetodoPago } from "./Venta";

export type EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";

export interface Pago {
  id: number;
  pedidoId?: number | null;
  ventaId?: number | null;
  metodo: MetodoPago; // Reutilizamos el tipo de Venta
  estado: EstadoPago;
  monto: number;

  // Información de MockPay (Integración)
  transaccionId?: string | null;
  referencia?: string | null;
  respuestaMockPay?: string | null;
  fechaPago?: string | null;

  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Lo que el frontend envía para iniciar un pago con MockPay
export interface IniciarPagoDTO {
  ventaId?: number | null;
  pedidoId?: number | null;
  metodo: MetodoPago;
  monto: number;
}

// Lo que el frontend recibe cuando MockPay responde (Webhook o callback)
export interface RespuestaMockPayDTO {
  transaccionId: string;
  estado: "APROBADO" | "RECHAZADO";
  referencia: string;
  respuestaRaw: string; // El JSON crudo que devuelve MockPay
}
