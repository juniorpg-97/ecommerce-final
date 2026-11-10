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
import { cajaService } from "../services/caja"; // ✅ NUEVO: Importar servicio de cajas
import { useCarritoStore } from "../store/carritoStore";
import { Boton } from "../componentes/ui/Boton";
import type { ProductoConDetalles } from "../types/Producto";

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

  // ✅ NUEVO: Estados para manejar la caja activa dinámicamente
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [cargandoCaja, setCargandoCaja] = useState(true);

  const { register, handleSubmit, watch } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: { metodoPago: "EFECTIVO", observaciones: "" },
  });

  const metodoPago = watch("metodoPago");
  const montoRecibido = watch("montoRecibido");
  const total = calcularTotal();

  // ✅ NUEVO: Obtener la caja activa al montar el componente
  useEffect(() => {
    const obtenerCaja = async () => {
      try {
        const caja = await cajaService.getActiva();
        setCajaActiva(caja);
      } catch (err: any) {
        setErrorVenta(
          err.response?.data?.message ||
            "No se pudo obtener la caja activa. ¿Abriste caja hoy?",
        );
      } finally {
        setCargandoCaja(false);
      }
    };
    obtenerCaja();
  }, []);

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

    // ✅ NUEVO: Validar que exista una caja activa antes de vender
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
        cajaId: cajaActiva.id, // ✅ DINÁMICO: Usa el ID real de la caja obtenida del backend
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

  // ✅ NUEVO: Pantalla de carga mientras verifica la caja
  if (cargandoCaja) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando estado de la caja...</p>
        </div>
      </div>
    );
  }

  // ✅ NUEVO: Pantalla de error si no hay caja abierta
  if (!cajaActiva && !cargandoCaja) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Caja Cerrada o No Encontrada
          </h2>
          <p className="text-red-600 mb-4">
            {errorVenta ||
              "Debes abrir una caja antes de poder realizar ventas."}
          </p>
          <Boton variante="primario" onClick={() => window.location.reload()}>
            Reintentar
          </Boton>
        </div>
      </div>
    );
  }

  // Si hay una venta exitosa, mostrar comprobante
  if (ventaExitosa) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-slate-200 print:shadow-none print:border-none">
        <div className="text-center mb-6 print:mb-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-slate-900">
            ¡Venta Completada!
          </h2>
          <p className="text-slate-600">Comprobante #{ventaExitosa.venta.id}</p>
        </div>

        <div className="border-t border-b border-slate-200 py-4 mb-4 print:py-2">
          {ventaExitosa.detalles.map((det: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm mb-2">
              <span>
                {det.cantidad}x Producto #{det.productoId}
              </span>
              <span className="font-mono">
                ${Number(det.subtotal).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-bold mb-6 print:mb-4">
          <span>Total Pagado:</span>
          <span>${Number(ventaExitosa.venta.totalVenta).toFixed(2)}</span>
        </div>

        <div className="text-sm text-slate-600 mb-6 print:mb-4">
          <p>Método de pago: {ventaExitosa.venta.metodoPago}</p>
          <p>Fecha: {new Date(ventaExitosa.venta.fecha).toLocaleString()}</p>
        </div>

        <div className="flex gap-3 print:hidden">
          <Boton
            variante="primario"
            onClick={handleImprimir}
            className="flex-1 gap-2"
          >
            <Printer size={18} /> Imprimir
          </Boton>
          <Boton
            variante="secundario"
            onClick={handleNuevaVenta}
            className="flex-1"
          >
            Nueva Venta
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Columna Izquierda: Buscador y Resultados */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Buscar Productos
        </h2>

        <input
          type="text"
          placeholder="Escribe el nombre del producto..."
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none mb-4"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto space-y-2">
          {resultadosBusqueda.map((prod: ProductoConDetalles) => {
            const enCarrito = items.find((i: any) => i.productoId === prod.id);
            const stockReal = prod.inventario?.stock ?? 0;

            return (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{prod.nombre}</p>
                  <p className="text-sm text-slate-600">
                    Stock:{" "}
                    <span
                      className={
                        stockReal === 0
                          ? "text-red-600 font-bold"
                          : "text-green-600"
                      }
                    >
                      {stockReal}
                    </span>{" "}
                    | Precio:{" "}
                    <span className="font-mono font-semibold">
                      ${Number(prod.precioVenta).toFixed(2)}
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
                  className="gap-2"
                >
                  <Plus size={16} /> {enCarrito ? "Agregar más" : "Agregar"}
                </Boton>
              </div>
            );
          })}
          {busqueda.length >= 2 && resultadosBusqueda.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No se encontraron productos.
            </p>
          )}
        </div>
      </div>

      {/* Columna Derecha: Carrito y Pago */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Resumen de Venta
        </h2>

        {/* Lista de ítems */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {items.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              El carrito está vacío
            </p>
          ) : (
            items.map((item: any) => (
              <div
                key={item.productoId}
                className="flex items-center gap-3 p-2 rounded border border-slate-100"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    ${Number(item.precioUnitario).toFixed(2)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      actualizarCantidad(item.productoId, item.cantidad - 1)
                    }
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      actualizarCantidad(item.productoId, item.cantidad + 1)
                    }
                    className="p-1 hover:bg-slate-100 rounded"
                    disabled={item.cantidad >= item.stockDisponible}
                  >
                    <Plus
                      size={16}
                      className={
                        item.cantidad >= item.stockDisponible
                          ? "text-slate-300"
                          : ""
                      }
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarProducto(item.productoId)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 pt-4 mb-4">
          <div className="flex justify-between text-xl font-bold text-slate-900">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulario de Pago */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Método de Pago
            </label>
            <select
              {...register("metodoPago")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="MOCKPAY">MockPay</option>
            </select>
          </div>

          {metodoPago === "EFECTIVO" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto Recibido ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montoRecibido", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                placeholder="0.00"
              />
              {montoRecibido !== undefined && montoRecibido >= total && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Cambio: ${(montoRecibido - total).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              {...register("observaciones")}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: Cliente frecuente"
            />
          </div>

          {errorVenta && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
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
            className="h-12 text-base gap-2"
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
