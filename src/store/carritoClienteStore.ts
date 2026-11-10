import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarritoCliente {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
}

interface CarritoClienteState {
  items: ItemCarritoCliente[];
  agregarProducto: (producto: Omit<ItemCarritoCliente, "cantidad">) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  eliminarProducto: (productoId: number) => void;
  limpiarCarrito: () => void;
  calcularSubtotal: () => number;
  contarItems: () => number;
  hayStockInsuficiente: () => boolean;
}

export const useCarritoClienteStore = create<CarritoClienteState>()(
  persist(
    (set, get) => ({
      items: [],

      agregarProducto: (producto) => {
        set((state) => {
          const existente = state.items.find(
            (i) => i.productoId === producto.productoId,
          );
          if (existente) {
            const nuevaCantidad = existente.cantidad + 1;
            if (nuevaCantidad > producto.stockDisponible) {
              alert(
                `No hay más stock disponible de "${producto.nombre}" (máx: ${producto.stockDisponible})`,
              );
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
          return {
            items: [...state.items, { ...producto, cantidad: 1 }],
          };
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
            alert(
              `Solo hay ${item.stockDisponible} unidades disponibles de "${item.nombre}"`,
            );
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

      calcularSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.precioUnitario * item.cantidad,
          0,
        );
      },

      contarItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      hayStockInsuficiente: () => {
        return get().items.some((item) => item.cantidad > item.stockDisponible);
      },
    }),
    {
      name: "carrito-cliente", // key en localStorage
    },
  ),
);
