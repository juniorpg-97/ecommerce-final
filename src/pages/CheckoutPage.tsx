import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  MapPin,
  Plus,
  Loader2,
} from "lucide-react";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
// ✅ IMPORTANTE: Importamos el store de auth para obtener el clienteId
import { useAuthStore } from "../store/authStore";
import { pedidoService } from "../services/pedidos";
import { direccionService } from "../services/direcciones";
import { carritoService } from "../services/carrito";
import { Boton } from "../componentes/ui/Boton";
import { CampoTexto } from "../componentes/ui/CampoTexto";
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

// ✅ Schema para crear dirección desde el checkout
const direccionFormSchema = z.object({
  calle: z.string().min(3, "La calle es requerida"),
  numero: z.string().min(1, "El número es requerido"),
  ciudad: z.string().min(3, "La ciudad es requerida"),
  referencia: z.string().optional(),
  codigoPostal: z.string().optional(),
});

type DireccionFormData = z.infer<typeof direccionFormSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();

  // ✅ OBTENEMOS EL CLIENTEID DEL STORE DE AUTENTICACIÓN
  // Asegúrate de que tu store guarde el 'clienteId' al hacer login
  const clienteId = useAuthStore((state) => state.clienteId);

  const { items, calcularSubtotal, limpiarCarrito, hayStockInsuficiente } =
    useCarritoClienteStore();

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);

  // Estados para el formulario de dirección inline
  const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
  const [creandoDireccion, setCreandoDireccion] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Formulario para crear dirección
  const {
    register: registerDir,
    handleSubmit: handleDirSubmit,
    reset: resetDirForm,
    formState: { errors: errorsDir },
  } = useForm<DireccionFormData>();

  const total = calcularSubtotal();

  const cargarDirecciones = async () => {
    setCargandoDirecciones(true);
    try {
      const dirs = await direccionService.getMisDirecciones();
      setDirecciones(dirs);

      if (dirs.length > 0) {
        setValue("direccionId", dirs[0].id);
        setMostrarFormDireccion(false);
      } else {
        // Si no hay direcciones, abrir el formulario automáticamente
        setMostrarFormDireccion(true);
      }
    } catch (err) {
      console.error("Error al cargar direcciones:", err);
      setError("No se pudieron cargar tus direcciones de envío.");
    } finally {
      setCargandoDirecciones(false);
    }
  };

  useEffect(() => {
    cargarDirecciones();
  }, [setValue]);

  // ✅ HANDLER CORREGIDO PARA CREAR DIRECCIÓN
  const onCreateDireccion = async (datos: DireccionFormData) => {
    if (!clienteId) {
      setErrorDireccion(
        "Error: No se pudo identificar al cliente. Inicia sesión nuevamente.",
      );
      return;
    }

    setCreandoDireccion(true);
    setErrorDireccion(null);

    try {
      // ✅ PASAMOS LOS 2 ARGUMENTOS QUE ESPERA TU SERVICIO: (clienteId, datos)
      await direccionService.create(clienteId, {
        calle: datos.calle,
        numero: datos.numero,
        ciudad: datos.ciudad,
        referencia: datos.referencia || "",
        codigoPostal: datos.codigoPostal || "00000",
      });

      // Recargar direcciones y cerrar formulario
      await cargarDirecciones();
      resetDirForm();
    } catch (err: any) {
      setErrorDireccion(
        err.response?.data?.message || "Error al guardar la dirección",
      );
    } finally {
      setCreandoDireccion(false);
    }
  };

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
                  S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 space-y-6"
          >
            {/* SECCIÓN DE DIRECCIÓN MEJORADA */}
            {/* ✅ SECCIÓN DE DIRECCIÓN CORREGIDA */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#F1F5F9] flex items-center gap-2">
                  <MapPin size={16} className="text-[#3B82F6]" />
                  Dirección de Envío
                </label>

                {/* Botón para agregar nueva dirección (solo si ya tiene direcciones y no está editando) */}
                {!mostrarFormDireccion && direcciones.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMostrarFormDireccion(true)}
                    className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Agregar nueva
                  </button>
                )}
              </div>

              {/* CASO 1: Mostrar formulario inline para crear dirección */}
              {mostrarFormDireccion ? (
                <div className="bg-[#0F172A] rounded-lg border border-[#334155] p-4 space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CampoTexto
                      id="calle"
                      etiqueta="Calle / Avenida"
                      placeholder="Av. Principal"
                      error={errorsDir.calle?.message}
                      {...registerDir("calle")}
                    />
                    <CampoTexto
                      id="numero"
                      etiqueta="Número"
                      placeholder="123"
                      error={errorsDir.numero?.message}
                      {...registerDir("numero")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CampoTexto
                      id="ciudad"
                      etiqueta="Ciudad / Distrito"
                      placeholder="Lima"
                      error={errorsDir.ciudad?.message}
                      {...registerDir("ciudad")}
                    />
                    <CampoTexto
                      id="codigoPostal"
                      etiqueta="Código Postal"
                      placeholder="15001"
                      error={errorsDir.codigoPostal?.message}
                      {...registerDir("codigoPostal")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="referencia"
                      className="block text-sm font-medium text-[#F1F5F9]"
                    >
                      Referencia (opcional)
                    </label>
                    <textarea
                      id="referencia"
                      rows={2}
                      placeholder="Ej: Frente al parque, casa azul"
                      className="w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      {...registerDir("referencia")}
                    />
                  </div>

                  {errorDireccion && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>{errorDireccion}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Boton
                      type="button"
                      variante="secundario"
                      onClick={() => {
                        setMostrarFormDireccion(false);
                        setErrorDireccion(null);
                      }}
                      className="flex-1 font-semibold transition-all"
                    >
                      Cancelar
                    </Boton>
                    <Boton
                      type="button"
                      variante="primario"
                      onClick={handleDirSubmit(onCreateDireccion)}
                      disabled={creandoDireccion}
                      className="flex-1 gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {creandoDireccion ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Guardar Dirección
                        </>
                      )}
                    </Boton>
                  </div>
                </div>
              ) : direcciones.length === 0 ? (
                /* CASO 2: No hay direcciones y no está editando -> Mostrar mensaje y botón automático */
                <div className="space-y-3">
                  <p className="text-sm text-[#EF4444]">
                    No tienes direcciones registradas. Agrégala para continuar.
                  </p>
                  <Boton
                    type="button"
                    variante="primario"
                    onClick={() => setMostrarFormDireccion(true)}
                    className="w-full gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-all"
                  >
                    <Plus size={16} /> Agregar mi primera dirección
                  </Boton>
                </div>
              ) : (
                /* CASO 3: Ya tiene direcciones -> Mostrar selector */
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

              {errors.direccionId && !mostrarFormDireccion && (
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
                S/ {total.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-[#334155] pt-2 mt-2 flex justify-between text-lg font-bold">
              <span className="text-[#F1F5F9]">Total</span>
              <span className="text-[#3B82F6]">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
