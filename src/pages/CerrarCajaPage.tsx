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
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !conciliacion) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">
          No se puede cerrar caja
        </h2>
        <p className="text-slate-600 mb-4">{error}</p>
        <Boton variante="primario" onClick={() => navigate("/dashboard")}>
          Volver al Dashboard
        </Boton>
      </div>
    );
  }

  if (exitoso) {
    const diff = exitoso.resumen.diferencia;
    const esCuadre = diff === 0;
    const falta = diff < 0;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Caja Cerrada Exitosamente
          </h2>
          <p className="text-slate-600 mb-6">
            La conciliación ha sido registrada en el sistema.
          </p>

          <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Monto Esperado:</span>
              <span className="font-mono font-semibold">
                ${exitoso.resumen.montoEsperado.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Monto Contado (Físico):</span>
              <span className="font-mono font-semibold">
                ${exitoso.resumen.montoContado.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-900">Diferencia:</span>
              <span
                className={`font-mono font-bold text-lg ${esCuadre ? "text-green-600" : falta ? "text-red-600" : "text-yellow-600"}`}
              >
                {esCuadre
                  ? "$0.00 (Cuadre perfecto)"
                  : `${falta ? "-" : "+"}$${Math.abs(diff).toFixed(2)}`}
              </span>
            </div>
          </div>

          <Boton
            variante="primario"
            onClick={() => navigate("/dashboard")}
            anchoCompleto
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <DollarSign className="text-blue-600" /> Cierre y Conciliación de Caja #
        {cajaActiva.id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Desglose del Sistema */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Desglose del Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Monto Inicial (Apertura)</span>
              <span className="font-mono font-medium">
                ${conciliacion.montoInicial.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Ventas POS</span>
              <span className="font-mono font-medium text-green-600">
                + ${conciliacion.totalVentasPOS.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-50 px-3 rounded-lg">
              <span className="font-bold text-blue-900">
                Monto Esperado en Caja
              </span>
              <span className="font-mono font-bold text-blue-900 text-lg">
                ${conciliacion.montoEsperado.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Ventas registradas en este turno:
            </h4>
            <div className="bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto text-sm space-y-2">
              {conciliacion.ventas.length === 0 ? (
                <p className="text-slate-500 italic">
                  No hay ventas registradas.
                </p>
              ) : (
                conciliacion.ventas.map((v: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-600">
                      Venta #{v.id} ({v.metodoPago})
                    </span>
                    <span className="font-mono">
                      ${Number(v.totalVenta).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Cierre */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-orange-600" />
            Registro de Cierre
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Efectivo Físico Contado ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montoContado", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-lg font-mono"
                placeholder="0.00"
              />
              {errors.montoContado && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.montoContado.message}
                </p>
              )}
            </div>

            {/* Panel de Diferencia en Tiempo Real */}
            <div
              className={`rounded-lg p-4 border ${esCuadre ? "bg-green-50 border-green-200" : falta ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {esCuadre ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : falta ? (
                  <AlertCircle size={20} className="text-red-600" />
                ) : (
                  <TrendingUp size={20} className="text-yellow-600" />
                )}
                <span
                  className={`font-bold ${esCuadre ? "text-green-800" : falta ? "text-red-800" : "text-yellow-800"}`}
                >
                  Resultado de la Conciliación
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-600">Diferencia:</span>
                <span
                  className={`font-mono font-bold text-2xl ${esCuadre ? "text-green-700" : falta ? "text-red-700" : "text-yellow-700"}`}
                >
                  {esCuadre
                    ? "$0.00"
                    : `${falta ? "-" : "+"}$${Math.abs(diferencia).toFixed(2)}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {esCuadre
                  ? "El efectivo coincide perfectamente con el sistema."
                  : falta
                    ? "Falta efectivo en comparación con lo registrado."
                    : "Sobra efectivo en comparación con lo registrado."}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={procesando}
              className="h-12 gap-2 text-base"
            >
              {procesando ? "Procesando cierre..." : "Confirmar y Cerrar Caja"}
            </Boton>
          </form>
        </div>
      </div>
    </div>
  );
}
