import type { InputHTMLAttributes, ReactNode } from "react";

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  icono?: ReactNode;
  error?: string;
}

export function CampoTexto({
  etiqueta,
  icono,
  error,
  className = "",
  id,
  ...resto
}: CampoTextoProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>
      <div className="relative">
        {icono && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icono}
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border ${
            error ? "border-red-500" : "border-slate-300"
          } bg-white px-3 py-2.5 ${icono ? "pl-10" : ""} text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none ${className}`}
          {...resto}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
