export type TipoVenta = "POS" | "REDES_SOCIALES" | "WEB";
export type EstadoVenta = "COMPLETADA" | "ANULADA";
export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA"
  | "TRANSFERENCIA"
  | "YAPE"
  | "PLIN"
  | "OTRO"
  | "MOCKPAY";

export interface Venta {
  id: number;
  pedidoId?: number | null;
  cajaId?: number | null;
  usuarioId: number;
  clienteId?: number | null;
  tipo: TipoVenta;
  fecha: string;
  subtotalVenta: number;
  descuento: number;
  totalVenta: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// TIPOS COMPUESTOS (Para el Frontend)
// ======================================================

// Para mostrar el ticket o la tabla de ventas con sus productos
export interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
  // Opcional: si el backend incluye el nombre del cajero o cliente
  usuario?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string; email: string };
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Para registrar una venta rápida desde el POS (sin pedido previo)
export interface CrearVentaPOSDTO {
  usuarioId: number;
  clienteId?: number | null;
  cajaId?: number | null;
  tipo: TipoVenta;
  metodoPago: MetodoPago;
  productos: {
    productoId: number;
    cantidad: number;
  }[];
  descuento?: number;
  observaciones?: string | null;
}
