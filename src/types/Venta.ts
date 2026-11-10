export interface DetalleVentaDTO {
  productoId: number;
  cantidad: number;
}

export interface CreateVentaDTO {
  cajaId: number;
  tipo?: "POS" | "REDES_SOCIALES" | "WEB";
  clienteId?: number;
  metodoPago:
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "YAPE"
    | "PLIN"
    | "OTRO"
    | "MOCKPAY";
  descuento?: number;
  observaciones?: string;
  detalles: DetalleVentaDTO[];
}

export interface VentaRespuesta {
  mensaje: string;
  venta: {
    id: number;
    subtotalVenta: number;
    descuento: number;
    totalVenta: number;
    metodoPago: string;
    fecha: string;
  };
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

export interface VentaHistorial {
  id: number;
  fecha: string;
  totalVenta: number;
  metodoPago: string;
  usuario: { nombre: string; apellido: string };
  detalles: {
    producto: { nombre: string; precioVenta: number };
    cantidad: number;
    subtotal: number;
  }[];
}
