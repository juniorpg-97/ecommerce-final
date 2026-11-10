export type EstadoPedido =
  | "PENDIENTE"
  | "PAGADO"
  | "EN_PREPARACION"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA"
  | "TRANSFERENCIA"
  | "YAPE"
  | "PLIN"
  | "OTRO"
  | "MOCKPAY";

export interface Pedido {
  id: number;
  clienteId: number;
  direccionId: number;
  estado: EstadoPedido;
  total: number;
  metodoPago: MetodoPago;
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  creadoEn: string;
  actualizadoEn: string;
}

// ======================================================
// TIPOS COMPUESTOS (Para el Frontend)
// ======================================================

// Para la tabla de "Mis Pedidos" o el dashboard de admin
export interface PedidoConDetalles extends Pedido {
  detalles: DetallePedido[];
  // Opcionalmente, si el backend incluye la dirección o el cliente:
  direccion?: {
    id: number;
    calle: string;
    numero: string;
    distrito?: string; // Si lo añadiste a tu schema, si no, bórralo
    ciudad: string;
  };
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Cuando el usuario hace "Checkout" (Pasar del carrito al pedido)
export interface CrearPedidoDTO {
  direccionId: number;
  metodoPago: MetodoPago;
  observaciones?: string | null;
  // No enviamos los productos aquí, el backend debe tomarlos del Carrito activo del cliente
  // para mantener la integridad de los precios.
}

// Para que el admin o el sistema cambie el estado (ej: de PAGADO a EN_CAMINO)
export interface ActualizarEstadoPedidoDTO {
  estado: EstadoPedido;
}
