import { memo } from "react";
import { ShoppingCart, Package, Check } from "lucide-react";
import type { ProductoConDetalles } from "../types/Producto";

interface CardProductoProps {
  producto: ProductoConDetalles;
  enCarrito?: boolean;
  fueAgregado?: boolean;
  onAgregar: (producto: ProductoConDetalles) => void;
}

export const CardProducto = memo(function CardProducto({
  producto,
  enCarrito = false,
  fueAgregado = false,
  onAgregar,
}: CardProductoProps) {
  const stockReal = producto.inventario?.stock ?? 0;
  const esAgotado = stockReal === 0;

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
        esAgotado ? "opacity-75" : ""
      }`}
    >
      <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
        <Package size={48} className="text-slate-400" />
        {esAgotado && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            AGOTADO
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 w-fit mb-2">
          {producto.categoria.nombre}
        </span>

        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto">
          <p className="text-2xl font-bold text-blue-600 mb-3">
            $
            {Number(producto.precioVenta).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Stock:{" "}
            <span
              className={
                esAgotado ? "text-red-600 font-bold" : "text-green-600"
              }
            >
              {stockReal}
            </span>
          </p>

          {/* ✅ CORREGIDO: Usar variante "primario" con clase condicional para verde */}
          <button
            disabled={esAgotado}
            onClick={() => onAgregar(producto)}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              fueAgregado
                ? "bg-green-600 hover:bg-green-700 text-white"
                : esAgotado
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : enCarrito
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {fueAgregado ? (
              <>
                <Check size={18} /> ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                {esAgotado
                  ? "Sin stock"
                  : enCarrito
                    ? "Agregar más"
                    : "Agregar al carrito"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
