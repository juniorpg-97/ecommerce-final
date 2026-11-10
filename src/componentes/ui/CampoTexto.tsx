import type { InputHTMLAttributes, ReactNode } from "react";

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  icono?: ReactNode;
  ayuda?: string;
}

export function CampoTexto({
  etiqueta,
  icono,
  ayuda,
  id,
  ...resto
}: CampoTextoProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>
      <div className="relative">
        {icono && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icono}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
            icono ? "pl-10" : "pl-3"
          }`}
          {...resto}
        />
      </div>
      {ayuda && <p className="text-xs text-slate-500">{ayuda}</p>}
    </div>
  );
}
