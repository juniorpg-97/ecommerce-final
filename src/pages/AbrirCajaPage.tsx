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
      await cajaService.create({ montoInicial: datos.montoInicial });
      navigate("/cajas/cerrar");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al abrir la caja",
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    // 🔥 CAMBIO CLAVE: Usar h-screen en lugar de min-h-screen
    <div className="h-screen w-full" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6 flex items-center gap-2">
          <DollarSign className="text-[#3B82F6]" /> Abrir Caja
        </h1>

        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Monto Inicial en Efectivo (S/)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montoInicial", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none text-lg font-mono transition-all"
                placeholder="0.00"
              />
              {errors.montoInicial && (
                <p className="text-sm text-[#EF4444] mt-1">
                  {errors.montoInicial.message}
                </p>
              )}
              <p className="text-xs text-[#94A3B8] mt-2">
                Este es el dinero en efectivo con el que se inicia el turno
                (sencillo para cambios).
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Boton
                type="button"
                variante="secundario"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-[#0F172A] hover:bg-[#334155] text-[#F1F5F9] border border-[#475569] font-semibold transition-all"
              >
                Cancelar
              </Boton>
              <Boton
                type="submit"
                variante="primario"
                disabled={procesando}
                className="flex-1 gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? "Abriendo..." : "Abrir Caja"}
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
