export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA"
  | "TRANSFERENCIA"
  | "YAPE"
  | "PLIN"
  | "OTRO"
  | "MOCKPAY";

export interface IniciarPagoDTO {
  ventaId?: number | null;
  pedidoId?: number | null;
  metodo: MetodoPago;
  monto: number;
}

export interface Pago {
  id: number;
  ventaId?: number | null;
  pedidoId?: number | null;
  metodo: MetodoPago;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";
  monto: number;
  transaccionId?: string | null;
  referencia?: string | null;
  respuestaMockPay?: string | null;
  fechaPago?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
}
