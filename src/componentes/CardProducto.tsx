import { memo, useState } from "react";
import { ShoppingCart, Package, Check, ImageOff } from "lucide-react";
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
  const [imagenFallida, setImagenFallida] = useState(false);

  return (
    <div
      className="group relative rounded-xl border border-[#303444]/40 overflow-hidden flex flex-col transition-all duration-300 hover:border-[#4d8eff]/30"
      style={{
        backgroundColor: "#1a1f2e",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* 🖼️ SECCIÓN DE IMAGEN */}
      <div
        className="aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#090e1c" }}
      >
        {producto.imagen && !imagenFallida ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImagenFallida(true)}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center"
            style={{ color: "#8c909f" }}
          >
            {imagenFallida ? <ImageOff size={48} /> : <Package size={48} />}
            <span className="text-xs mt-2">Sin imagen</span>
          </div>
        )}

        {esAgotado && (
          <span
            className="absolute top-3 right-3 font-mono text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: "rgba(147, 0, 10, 0.3)",
              color: "#ffb4ab",
              borderColor: "rgba(255, 180, 171, 0.3)",
            }}
          >
            AGOTADO
          </span>
        )}
      </div>

      {/* 📝 SECCIÓN DE INFORMACIÓN */}
      <div className="p-4 flex-1 flex flex-col">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit mb-3 border"
          style={{
            backgroundColor: "rgba(77, 142, 255, 0.15)",
            color: "#adc6ff",
            borderColor: "rgba(173, 198, 255, 0.2)",
          }}
        >
          {producto.categoria.nombre}
        </span>

        <h3
          className="font-bold text-lg mb-1.5 line-clamp-2 leading-tight"
          style={{
            color: "#dee2f6",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p
            className="text-sm mb-4 line-clamp-2 flex-1"
            style={{ color: "#c2c6d6" }}
          >
            {producto.descripcion}
          </p>
        )}

        <div
          className="mt-auto pt-3 border-t"
          style={{ borderColor: "rgba(48, 52, 68, 0.3)" }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <p
              className="text-2xl font-extrabold tracking-tight"
              style={{
                color: "#adc6ff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              $
              {Number(producto.precioVenta).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </p>
            <span className="font-mono text-xs" style={{ color: "#c2c6d6" }}>
              Stock:{" "}
              <span
                className={
                  esAgotado
                    ? "text-[#ffb4ab] font-bold"
                    : "text-[#ffb690] font-bold"
                }
              >
                {stockReal}
              </span>
            </span>
          </div>

          <button
            disabled={esAgotado}
            onClick={() => onAgregar(producto)}
            className="w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            style={{
              backgroundColor: fueAgregado
                ? "#ec6a06"
                : esAgotado
                  ? "#252a39"
                  : enCarrito
                    ? "rgba(173, 198, 255, 0.1)"
                    : "#4d8eff",
              color: fueAgregado
                ? "#552100"
                : esAgotado
                  ? "#8c909f"
                  : enCarrito
                    ? "#adc6ff"
                    : "#002e6a",
              cursor: esAgotado ? "not-allowed" : "pointer",
              border: enCarrito ? "1px solid rgba(173, 198, 255, 0.3)" : "none",
              boxShadow:
                !esAgotado && !fueAgregado && !enCarrito
                  ? "0 0 16px rgba(77, 142, 255, 0.25)"
                  : "none",
            }}
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
