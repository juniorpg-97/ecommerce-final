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

export interface CreatePedidoDTO {
  direccionId: number;
  metodoPago: MetodoPago;
}

export interface Pedido {
  id: number;
  clienteId: number;
  direccionId: number;
  estado: EstadoPedido;
  total: number;
  metodoPago: MetodoPago;
  creadoEn: string;
  cliente?: { nombre: string; apellido: string; email: string };
  direccion?: {
    calle: string;
    numero: string;
    referencia?: string;
    ciudad: string;
  };
  detalles: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    producto: { id: number; nombre: string; precioVenta: number };
  }[];
}
