export interface Carrito {
  id: number;
  clienteId: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DetalleCarrito {
  id: number;
  carritoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DetalleCarritoConProducto extends DetalleCarrito {
  producto: {
    id: number;
    nombre: string;
    imagenUrl?: string | null;
  };
}

export interface AgregarAlCarritoDTO {
  productoId: number;
  cantidad: number;
}

export interface ActualizarCantidadDTO {
  cantidad: number;
}
