import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart, CreditCard, AlertTriangle } from "lucide-react";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
import { pedidoService } from "../services/pedidos";
import { direccionService } from "../services/direcciones";
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl p-8 text-center max-w-md">
          <ShoppingCart size={64} className="mx-auto text-[#64748B] mb-4" />
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">
            Tu carrito está vacío
          </h2>
          <Boton
            variante="primario"
            onClick={() => navigate("/")}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
          >
            Volver a la tienda
          </Boton>
        </div>
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
      const detallesParaBD = items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      }));
      await carritoService.sincronizar(detallesParaBD);

      await pedidoService.create({
        direccionId: datos.direccionId,
        metodoPago: datos.metodoPago,
      });

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto py-8 px-4 min-h-screen"
      style={{ backgroundColor: "#0F172A" }}
    >
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen del Pedido */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-4">
            <h2 className="font-semibold text-[#F1F5F9] mb-4">
              Productos ({items.length})
            </h2>
            {items.map((item) => (
              <div
                key={item.productoId}
                className="flex justify-between items-center py-3 border-b border-[#334155] last:border-0"
              >
                <div>
                  <p className="font-medium text-[#F1F5F9]">{item.nombre}</p>
                  <p className="text-sm text-[#94A3B8]">
                    Cantidad: {item.cantidad}
                  </p>
                </div>
                <p className="font-mono font-semibold text-[#3B82F6]">
                  S/{(item.precioUnitario * item.cantidad).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Dirección de Envío
              </label>
              {direcciones.length === 0 ? (
                <p className="text-sm text-[#EF4444]">
                  No tienes direcciones registradas. Agrégala desde tu perfil.
                </p>
              ) : (
                <select
                  {...register("direccionId", { valueAsNumber: true })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] focus:border-[#3B82F6] outline-none transition-all"
                >
                  {direcciones.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#0F172A]">
                      {d.calle} {d.numero}, {d.ciudad}{" "}
                      {d.referencia ? `(${d.referencia})` : ""}
                    </option>
                  ))}
                </select>
              )}
              {errors.direccionId && (
                <p className="text-xs text-[#EF4444] mt-1">
                  {errors.direccionId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Método de Pago
              </label>
              <select
                {...register("metodoPago")}
                className="w-full px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] focus:border-[#3B82F6] outline-none transition-all"
              >
                <option value="YAPE" className="bg-[#0F172A]">
                  Yape
                </option>
                <option value="PLIN" className="bg-[#0F172A]">
                  Plin
                </option>
                <option value="TRANSFERENCIA" className="bg-[#0F172A]">
                  Transferencia
                </option>
                <option value="TARJETA" className="bg-[#0F172A]">
                  Tarjeta
                </option>
                <option value="EFECTIVO" className="bg-[#0F172A]">
                  Efectivo contra entrega
                </option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={procesando || direcciones.length === 0}
              className="h-12 gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 h-fit">
          <h3 className="font-semibold text-[#F1F5F9] mb-4">Resumen</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Subtotal</span>
              <span className="font-mono text-[#F1F5F9]">
                S/{total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Envío</span>
              <span className="font-mono text-[#10B981]">Gratis</span>
            </div>
            <div className="border-t border-[#334155] pt-2 mt-2 flex justify-between text-lg font-bold">
              <span className="text-[#F1F5F9]">Total</span>
              <span className="text-[#3B82F6]">S/{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
