import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Printer,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { productoService } from "../services/productos";
import { ventaService } from "../services/ventas";
import { useCarritoStore } from "../store/carritoStore";
import { Boton } from "../componentes/ui/Boton";
import type { ProductoConDetalles } from "../types/Producto";
import { useCaja } from "../hooks/useCaja";

const ventaSchema = z.object({
  metodoPago: z.enum([
    "EFECTIVO",
    "TARJETA",
    "TRANSFERENCIA",
    "YAPE",
    "PLIN",
    "OTRO",
    "MOCKPAY",
  ]),
  montoRecibido: z
    .number()
    .min(0, "El monto debe ser mayor o igual a 0")
    .optional(),
  observaciones: z.string().optional(),
});

type VentaFormData = z.infer<typeof ventaSchema>;

export default function POSPage() {
  const {
    items,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
    calcularTotal,
    hayStockInsuficiente,
  } = useCarritoStore();

  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<
    ProductoConDetalles[]
  >([]);
  const [procesando, setProcesando] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<any>(null);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);

  const { register, handleSubmit, watch } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: { metodoPago: "EFECTIVO", observaciones: "" },
  });

  const metodoPago = watch("metodoPago");
  const montoRecibido = watch("montoRecibido");
  const total = calcularTotal();
  const { cajaActiva, cargando: cargandoCaja, error: errorCaja } = useCaja();

  // Buscar productos
  useEffect(() => {
    if (busqueda.length < 2) {
      setResultadosBusqueda([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const productos = await productoService.getAll();
        const filtrados = productos.filter(
          (p: ProductoConDetalles) =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && p.activo,
        );
        setResultadosBusqueda(filtrados);
      } catch (err) {
        console.error("Error al buscar productos", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const onSubmit = async (datos: VentaFormData) => {
    if (items.length === 0) return;

    if (!cajaActiva) {
      setErrorVenta("No hay una caja activa. No se puede procesar la venta.");
      return;
    }

    if (hayStockInsuficiente()) {
      setErrorVenta("Hay productos con cantidad mayor al stock disponible.");
      return;
    }

    setProcesando(true);
    setErrorVenta(null);

    try {
      const detalles = items.map((item: any) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      const respuesta = await ventaService.create({
        cajaId: cajaActiva.id,
        tipo: "POS",
        metodoPago: datos.metodoPago,
        observaciones: datos.observaciones,
        detalles,
      });

      setVentaExitosa(respuesta);
      limpiarCarrito();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al procesar la venta";
      setErrorVenta(msg);
    } finally {
      setProcesando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleNuevaVenta = () => {
    setVentaExitosa(null);
    setErrorVenta(null);
  };

  if (cargandoCaja) {
    return (
      <div
        className="flex h-[calc(100vh-8rem)] items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Verificando estado de la caja...</p>
        </div>
      </div>
    );
  }

  // ✅ Pantalla de error si no hay caja abierta
  if (!cajaActiva && !cargandoCaja) {
    return (
      <div
        className="flex h-[calc(100vh-8rem)] items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-8 text-center max-w-md shadow-xl">
          <AlertCircle size={48} className="mx-auto text-[#EF4444] mb-4" />
          <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
            Caja Cerrada o No Encontrada
          </h2>
          <p className="text-[#94A3B8] mb-4">
            {errorCaja ||
              "Debes abrir una caja antes de poder realizar ventas."}
          </p>
          <Boton
            variante="primario"
            onClick={() => window.location.reload()}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Reintentar
          </Boton>
        </div>
      </div>
    );
  }

  // Si hay una venta exitosa, mostrar comprobante
  if (ventaExitosa) {
    return (
      <div
        className="max-w-2xl mx-auto bg-[#1E293B] p-8 rounded-lg shadow-xl border border-[#334155] print:shadow-none print:border-none"
        style={{ color: "#F1F5F9" }}
      >
        <div className="text-center mb-6 print:mb-4">
          <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">
            ¡Venta Completada!
          </h2>
          <p className="text-[#94A3B8]">Comprobante #{ventaExitosa.venta.id}</p>
        </div>

        <div className="border-t border-b border-[#334155] py-4 mb-4 print:py-2">
          {ventaExitosa.detalles.map((det: any, idx: number) => (
            <div
              key={idx}
              className="flex justify-between text-sm mb-2 text-[#F1F5F9]"
            >
              <span>
                {det.cantidad}x Producto #{det.productoId}
              </span>
              <span className="font-mono">
                ${Number(det.subtotal).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-bold mb-6 print:mb-4 text-[#F1F5F9]">
          <span>Total Pagado:</span>
          <span className="text-[#3B82F6]">
            S/{Number(ventaExitosa.venta.totalVenta).toFixed(2)}
          </span>
        </div>

        <div className="text-sm text-[#94A3B8] mb-6 print:mb-4">
          <p>Método de pago: {ventaExitosa.venta.metodoPago}</p>
          <p>Fecha: {new Date(ventaExitosa.venta.fecha).toLocaleString()}</p>
        </div>

        <div className="flex gap-3 print:hidden">
          <Boton
            variante="primario"
            onClick={handleImprimir}
            className="flex-1 gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Printer size={18} /> Imprimir
          </Boton>
          <Boton
            variante="secundario"
            onClick={handleNuevaVenta}
            className="flex-1 bg-[#0F172A] hover:bg-[#334155] text-[#F1F5F9] border border-[#475569] font-semibold transition-all"
          >
            Nueva Venta
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] p-6"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Columna Izquierda: Buscador y Resultados */}
      <div className="lg:col-span-2 bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
          <ShoppingCart className="text-[#3B82F6]" /> Buscar Productos
        </h2>

        <input
          type="text"
          placeholder="Escribe el nombre del producto..."
          className="w-full px-4 py-3 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none mb-4 transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {resultadosBusqueda.map((prod: ProductoConDetalles) => {
            const enCarrito = items.find((i: any) => i.productoId === prod.id);
            const stockReal = prod.inventario?.stock ?? 0;

            return (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#334155] hover:bg-[#0F172A] transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#F1F5F9]">{prod.nombre}</p>
                  <p className="text-sm text-[#94A3B8]">
                    Stock:{" "}
                    <span
                      className={
                        stockReal === 0
                          ? "text-[#EF4444] font-bold"
                          : "text-[#10B981]"
                      }
                    >
                      {stockReal}
                    </span>{" "}
                    | Precio:{" "}
                    <span className="font-mono font-semibold text-[#F1F5F9]">
                      S/{Number(prod.precioVenta).toFixed(2)}
                    </span>
                  </p>
                </div>
                <Boton
                  variante={enCarrito ? "secundario" : "primario"}
                  disabled={stockReal === 0}
                  onClick={() =>
                    agregarProducto({
                      productoId: prod.id,
                      nombre: prod.nombre,
                      precioUnitario: Number(prod.precioVenta),
                      stockDisponible: stockReal,
                    })
                  }
                  className={`gap-2 ${
                    enCarrito
                      ? "bg-[#0F172A] hover:bg-[#334155] text-[#F1F5F9] border border-[#475569]"
                      : "bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-blue-500/20"
                  } transition-all`}
                >
                  <Plus size={16} /> {enCarrito ? "Agregar más" : "Agregar"}
                </Boton>
              </div>
            );
          })}
          {busqueda.length >= 2 && resultadosBusqueda.length === 0 && (
            <p className="text-center text-[#94A3B8] py-8">
              No se encontraron productos.
            </p>
          )}
        </div>
      </div>

      {/* Columna Derecha: Carrito y Pago */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">
          Resumen de Venta
        </h2>

        {/* Lista de ítems */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {items.length === 0 ? (
            <p className="text-center text-[#94A3B8] py-8">
              El carrito está vacío
            </p>
          ) : (
            items.map((item: any) => (
              <div
                key={item.productoId}
                className="flex items-center gap-3 p-3 rounded border border-[#334155] bg-[#0F172A]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F1F5F9] truncate">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-[#94A3B8] font-mono">
                    S/ {Number(item.precioUnitario).toFixed(2)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      actualizarCantidad(item.productoId, item.cantidad - 1)
                    }
                    className="p-1 hover:bg-[#334155] rounded text-[#F1F5F9] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold text-[#F1F5F9]">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      actualizarCantidad(item.productoId, item.cantidad + 1)
                    }
                    className="p-1 hover:bg-[#334155] rounded text-[#F1F5F9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.cantidad >= item.stockDisponible}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarProducto(item.productoId)}
                  className="p-1 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="border-t border-[#334155] pt-4 mb-4">
          <div className="flex justify-between text-xl font-bold text-[#F1F5F9]">
            <span>Total:</span>
            <span className="text-[#3B82F6]">S/{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulario de Pago */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-1">
              Método de Pago
            </label>
            <select
              {...register("metodoPago")}
              className="w-full px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="EFECTIVO" className="bg-[#0F172A]">
                Efectivo
              </option>
              <option value="TARJETA" className="bg-[#0F172A]">
                Tarjeta
              </option>
              <option value="TRANSFERENCIA" className="bg-[#0F172A]">
                Transferencia
              </option>
              <option value="YAPE" className="bg-[#0F172A]">
                Yape
              </option>
              <option value="PLIN" className="bg-[#0F172A]">
                Plin
              </option>
              <option value="MOCKPAY" className="bg-[#0F172A]">
                MockPay
              </option>
            </select>
          </div>

          {metodoPago === "EFECTIVO" && (
            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-1">
                Monto Recibido (S/)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montoRecibido", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="0.00"
              />
              {montoRecibido !== undefined && montoRecibido >= total && (
                <p className="text-sm text-[#10B981] mt-1 font-medium">
                  Cambio: S/{(montoRecibido - total).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              {...register("observaciones")}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all resize-none"
              placeholder="Ej: Cliente frecuente"
            />
          </div>

          {errorVenta && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{errorVenta}</span>
            </div>
          )}

          <Boton
            type="submit"
            variante="primario"
            anchoCompleto
            disabled={
              procesando || items.length === 0 || hayStockInsuficiente()
            }
            className="h-12 text-base gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirmar Venta
              </>
            )}
          </Boton>
        </form>
      </div>
    </div>
  );
}
