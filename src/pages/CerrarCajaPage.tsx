import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cajaService } from "../services/caja";
import { Boton } from "../componentes/ui/Boton";

const cerrarCajaSchema = z.object({
  montoContado: z.number().min(0, "El monto contado no puede ser negativo"),
});

type CerrarCajaFormData = z.infer<typeof cerrarCajaSchema>;

export default function CerrarCajaPage() {
  const navigate = useNavigate();
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [conciliacion, setConciliacion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitoso, setExitoso] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CerrarCajaFormData>({
    resolver: zodResolver(cerrarCajaSchema),
    defaultValues: { montoContado: 0 },
  });

  const montoContado = watch("montoContado") || 0;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const todas = await cajaService.getAll();
        const abierta = todas.find((c: any) => c.estado === "ABIERTA");

        if (!abierta) {
          setError("No hay ninguna caja abierta actualmente.");
          setCargando(false);
          return;
        }

        setCajaActiva(abierta);
        const datosConciliacion = await cajaService.getConciliacion(abierta.id);
        setConciliacion(datosConciliacion);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error al cargar los datos de la caja",
        );
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const onSubmit = async (datos: CerrarCajaFormData) => {
    if (!cajaActiva) return;
    setProcesando(true);
    setError(null);
    try {
      const resultado = await cajaService.cerrar(
        cajaActiva.id,
        datos.montoContado,
      );
      setExitoso(resultado);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al cerrar la caja",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div
        className="flex h-96 items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (error && !conciliacion) {
    return (
      <div
        className="max-w-2xl mx-auto py-8 px-4 text-center min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-8 shadow-lg w-full">
          <AlertCircle size={48} className="mx-auto text-[#EF4444] mb-4" />
          <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
            No se puede cerrar caja
          </h2>
          <p className="text-[#94A3B8] mb-6">{error}</p>
          <Boton
            variante="primario"
            onClick={() => navigate("/dashboard")}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Volver al Dashboard
          </Boton>
        </div>
      </div>
    );
  }

  if (exitoso) {
    const diff = exitoso.resumen.diferencia;
    const esCuadre = diff === 0;
    const falta = diff < 0;

    return (
      <div
        className="max-w-2xl mx-auto py-8 px-4 min-h-screen"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-[#10B981] mb-4" />
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
            Caja Cerrada Exitosamente
          </h2>
          <p className="text-[#94A3B8] mb-6">
            La conciliación ha sido registrada en el sistema.
          </p>

          <div className="bg-[#0F172A] rounded-lg p-6 mb-6 text-left space-y-3 border border-[#334155]">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Monto Esperado:</span>
              <span className="font-mono font-semibold text-[#F1F5F9]">
                S/{exitoso.resumen.montoEsperado.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Monto Contado (Físico):</span>
              <span className="font-mono font-semibold text-[#F1F5F9]">
                S/{exitoso.resumen.montoContado.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-[#334155] pt-3 flex justify-between items-center">
              <span className="font-bold text-[#F1F5F9]">Diferencia:</span>
              <span
                className={`font-mono font-bold text-lg ${esCuadre ? "text-[#10B981]" : falta ? "text-[#EF4444]" : "text-[#F59E0B]"}`}
              >
                {esCuadre
                  ? "S/0.00 (Cuadre perfecto)"
                  : `${falta ? "-" : "+"}S/${Math.abs(diff).toFixed(2)}`}
              </span>
            </div>
          </div>

          <Boton
            variante="primario"
            onClick={() => navigate("/dashboard")}
            anchoCompleto
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Volver al Dashboard
          </Boton>
        </div>
      </div>
    );
  }

  const diferencia = montoContado - (conciliacion?.montoEsperado || 0);
  const esCuadre = diferencia === 0;
  const falta = diferencia < 0;

  return (
    <div
      className="max-w-4xl mx-auto py-8 px-4 min-h-screen"
      style={{ backgroundColor: "#0F172A" }}
    >
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6 flex items-center gap-2">
        <DollarSign className="text-[#3B82F6]" /> Cierre y Conciliación de Caja
        #{cajaActiva.id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Desglose del Sistema */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <h3 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#3B82F6]" />
            Desglose del Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#334155]">
              <span className="text-[#94A3B8]">Monto Inicial (Apertura)</span>
              <span className="font-mono font-medium text-[#F1F5F9]">
                S/{conciliacion.montoInicial.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#334155]">
              <span className="text-[#94A3B8]">Total Ventas POS</span>
              <span className="font-mono font-medium text-[#10B981]">
                + ${conciliacion.totalVentasPOS.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-500/10 px-3 rounded-lg border border-blue-500/30">
              <span className="font-bold text-blue-400">
                Monto Esperado en Caja
              </span>
              <span className="font-mono font-bold text-blue-400 text-lg">
                S/{conciliacion.montoEsperado.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[#F1F5F9] mb-2">
              Ventas registradas en este turno:
            </h4>
            <div className="bg-[#0F172A] rounded-lg p-3 max-h-48 overflow-y-auto text-sm space-y-2 border border-[#334155]">
              {conciliacion.ventas.length === 0 ? (
                <p className="text-[#64748B] italic">
                  No hay ventas registradas.
                </p>
              ) : (
                conciliacion.ventas.map((v: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#94A3B8]">
                      Venta #{v.id} ({v.metodoPago})
                    </span>
                    <span className="font-mono text-[#F1F5F9]">
                      S/{Number(v.totalVenta).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Cierre */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <h3 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-[#F97316]" />
            Registro de Cierre
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Efectivo Físico Contado ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montoContado", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none text-lg font-mono transition-all"
                placeholder="0.00"
              />
              {errors.montoContado && (
                <p className="text-sm text-[#EF4444] mt-1">
                  {errors.montoContado.message}
                </p>
              )}
            </div>

            {/* Panel de Diferencia en Tiempo Real */}
            <div
              className={`rounded-lg p-4 border ${esCuadre ? "bg-green-500/10 border-green-500/30" : falta ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {esCuadre ? (
                  <CheckCircle size={20} className="text-[#10B981]" />
                ) : falta ? (
                  <AlertCircle size={20} className="text-[#EF4444]" />
                ) : (
                  <TrendingUp size={20} className="text-[#F59E0B]" />
                )}
                <span
                  className={`font-bold ${esCuadre ? "text-[#10B981]" : falta ? "text-[#EF4444]" : "text-[#F59E0B]"}`}
                >
                  Resultado de la Conciliación
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-[#94A3B8]">Diferencia:</span>
                <span
                  className={`font-mono font-bold text-2xl ${esCuadre ? "text-[#10B981]" : falta ? "text-[#EF4444]" : "text-[#F59E0B]"}`}
                >
                  {esCuadre
                    ? "S/0.00"
                    : `${falta ? "-" : "+"}S/${Math.abs(diferencia).toFixed(2)}`}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-2">
                {esCuadre
                  ? "El efectivo coincide perfectamente con el sistema."
                  : falta
                    ? "Falta efectivo en comparación con lo registrado."
                    : "Sobra efectivo en comparación con lo registrado."}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={procesando}
              className="h-12 gap-2 text-base bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? "Procesando cierre..." : "Confirmar y Cerrar Caja"}
            </Boton>
          </form>
        </div>
      </div>
    </div>
  );
}
