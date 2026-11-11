import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, AlertCircle } from "lucide-react";
import { cajaService } from "../services/caja";
import { Boton } from "../componentes/ui/Boton";

const abrirCajaSchema = z.object({
  montoInicial: z.number().min(0, "El monto inicial no puede ser negativo"),
});

type AbrirCajaFormData = z.infer<typeof abrirCajaSchema>;

export default function AbrirCajaPage() {
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AbrirCajaFormData>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: { montoInicial: 0 },
  });

  const onSubmit = async (datos: AbrirCajaFormData) => {
    setProcesando(true);
    setError(null);
    try {
      // El backend usa el usuario del token JWT automáticamente
      await cajaService.create({ montoInicial: datos.montoInicial });
      navigate("/cajas/cerrar"); // Redirigir al panel de cierre/historial
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al abrir la caja",
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <DollarSign className="text-blue-600" /> Abrir Caja
      </h1>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Monto Inicial en Efectivo ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("montoInicial", { valueAsNumber: true })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-lg font-mono"
              placeholder="0.00"
            />
            {errors.montoInicial && (
              <p className="text-sm text-red-600 mt-1">
                {errors.montoInicial.message}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Este es el dinero en efectivo con el que se inicia el turno
              (sencillo para cambios).
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Boton
              type="button"
              variante="secundario"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Cancelar
            </Boton>
            <Boton
              type="submit"
              variante="primario"
              disabled={procesando}
              className="flex-1 gap-2"
            >
              {procesando ? "Abriendo..." : "Abrir Caja"}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
