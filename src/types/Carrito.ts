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

// ======================================================
// TIPOS COMPUESTOS (Para el Frontend)
// ======================================================

// Cuando mostramos el carrito en el UI, necesitamos ver el nombre y la imagen del producto,
// no solo el productoId. Esta interfaz asume que el backend hace un include del producto.
export interface DetalleCarritoConProducto extends DetalleCarrito {
  producto: {
    id: number;
    nombre: string;
    imagenUrl?: string | null;
    // Añadimos lo mínimo necesario del producto para la UI
  };
}

// ======================================================
// DTOs (Data Transfer Objects) para Formularios
// ======================================================

// Lo que el frontend envía al hacer click en "Agregar al carrito"
export interface AgregarAlCarritoDTO {
  productoId: number;
  cantidad: number;
  // Nota: No enviamos precioUnitario aquí, el backend debe obtenerlo
  // del producto actual para evitar manipulaciones de precio desde el frontend.
}

// Lo que el frontend envía cuando el usuario cambia la cantidad en el UI (+ / -)
export interface ActualizarCantidadDTO {
  cantidad: number;
}
