import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart, CreditCard, AlertTriangle } from "lucide-react";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
import { pedidoService } from "../services/pedidos";
import { direccionService } from "../services/direcciones"; // Tu servicio actualizado
import { carritoService } from "../services/carrito";
import { Boton } from "../componentes/ui/Boton";
import type { Direccion } from "../types/Direccion";

const checkoutSchema = z.object({
  direccionId: z.number().min(1, "Selecciona una dirección"),
  metodoPago: z.enum([
    "EFECTIVO",
    "TARJETA",
    "TRANSFERENCIA",
    "YAPE",
    "PLIN",
    "OTRO",
    "MOCKPAY",
  ]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, calcularSubtotal, limpiarCarrito, hayStockInsuficiente } =
    useCarritoClienteStore();

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const total = calcularSubtotal();

  // Cargar direcciones del cliente autenticado
  useEffect(() => {
    const cargarDirecciones = async () => {
      try {
        const dirs = await direccionService.getMisDirecciones();
        setDirecciones(dirs);

        if (dirs.length > 0) {
          setValue("direccionId", dirs[0].id);
        }
      } catch (err) {
        console.error("Error al cargar direcciones:", err);
        setError("No se pudieron cargar tus direcciones de envío.");
      } finally {
        setCargandoDirecciones(false);
      }
    };
    cargarDirecciones();
  }, [setValue]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingCart size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Tu carrito está vacío
        </h2>
        <Boton variante="primario" onClick={() => navigate("/")}>
          Volver a la tienda
        </Boton>
      </div>
    );
  }

  const onSubmit = async (datos: CheckoutFormData) => {
    if (hayStockInsuficiente()) {
      setError(
        "Algunos productos en tu carrito ya no tienen stock suficiente.",
      );
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      // 1. Sincronizar carrito con la BD
      const detallesParaBD = items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      }));
      await carritoService.sincronizar(detallesParaBD);

      // 2. Crear el pedido
      await pedidoService.create({
        direccionId: datos.direccionId,
        metodoPago: datos.metodoPago,
      });

      // 3. Limpiar y redirigir
      limpiarCarrito();
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al procesar el pedido";
      setError(msg);
    } finally {
      setProcesando(false);
    }
  };

  if (cargandoDirecciones) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen del Pedido */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900 mb-4">
              Productos ({items.length})
            </h2>
            {items.map((item) => (
              <div
                key={item.productoId}
                className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.nombre}</p>
                  <p className="text-sm text-slate-600">
                    Cantidad: {item.cantidad}
                  </p>
                </div>
                <p className="font-mono font-semibold">
                  ${(item.precioUnitario * item.cantidad).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-slate-200 p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección de Envío
              </label>
              {direcciones.length === 0 ? (
                <p className="text-sm text-red-600">
                  No tienes direcciones registradas. Agrégala desde tu perfil.
                </p>
              ) : (
                <select
                  {...register("direccionId", { valueAsNumber: true })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                >
                  {direcciones.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.calle} {d.numero}, {d.ciudad}{" "}
                      {d.referencia ? `(${d.referencia})` : ""}
                    </option>
                  ))}
                </select>
              )}
              {errors.direccionId && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.direccionId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Método de Pago
              </label>
              <select
                {...register("metodoPago")}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
              >
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="EFECTIVO">Efectivo contra entrega</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={procesando || direcciones.length === 0}
              className="h-12 gap-2"
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
                  <CreditCard size={18} /> Confirmar Pedido
                </>
              )}
            </Boton>
          </form>
        </div>

        {/* Total */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 h-fit">
          <h3 className="font-semibold text-slate-900 mb-4">Resumen</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Envío</span>
              <span className="font-mono text-green-600">Gratis</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
