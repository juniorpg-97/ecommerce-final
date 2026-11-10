import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "fantasma";
  anchoCompleto?: boolean;
  children: ReactNode;
}

export function Boton({
  variante = "primario",
  anchoCompleto = false,
  children,
  className = "",
  ...resto
}: BotonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variantes = {
    primario:
      "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 shadow-lg shadow-blue-900/20",
    secundario:
      "bg-orange-600 text-white hover:bg-orange-500 focus:ring-orange-500 shadow-lg shadow-orange-900/20",
    fantasma:
      "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400", // ✅ Agregada
  };

  return (
    <button
      className={`${base} ${variantes[variante]} ${anchoCompleto ? "w-full" : ""} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}
