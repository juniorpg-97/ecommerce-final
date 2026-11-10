import { create } from "zustand";

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
}

interface CarritoState {
  items: ItemCarrito[];
  agregarProducto: (producto: Omit<ItemCarrito, "cantidad">) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  eliminarProducto: (productoId: number) => void;
  limpiarCarrito: () => void;
  calcularTotal: () => number;
  hayStockInsuficiente: () => boolean;
}

export const useCarritoStore = create<CarritoState>((set, get) => ({
  items: [],

  agregarProducto: (producto) => {
    set((state) => {
      const existente = state.items.find(
        (i) => i.productoId === producto.productoId,
      );
      if (existente) {
        const nuevaCantidad = existente.cantidad + 1;
        if (nuevaCantidad > producto.stockDisponible) {
          alert(`Stock máximo alcanzado para "${producto.nombre}"`);
          return state;
        }
        return {
          items: state.items.map((i) =>
            i.productoId === producto.productoId
              ? { ...i, cantidad: nuevaCantidad }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...producto, cantidad: 1 }] };
    });
  },

  actualizarCantidad: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().eliminarProducto(productoId);
      return;
    }
    set((state) => {
      const item = state.items.find((i) => i.productoId === productoId);
      if (item && cantidad > item.stockDisponible) {
        alert(`Solo hay ${item.stockDisponible} unidades disponibles`);
        return state;
      }
      return {
        items: state.items.map((i) =>
          i.productoId === productoId ? { ...i, cantidad } : i,
        ),
      };
    });
  },

  eliminarProducto: (productoId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productoId !== productoId),
    }));
  },

  limpiarCarrito: () => set({ items: [] }),

  calcularTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.precioUnitario * item.cantidad,
      0,
    );
  },

  hayStockInsuficiente: () => {
    return get().items.some((item) => item.cantidad > item.stockDisponible);
  },
}));
