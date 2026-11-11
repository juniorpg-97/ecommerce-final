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
      <label
        htmlFor={id}
        className="block text-sm font-medium"
        style={{ color: "#dee2f6" }}
      >
        {etiqueta}
      </label>
      <div className="relative">
        {icono && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#c2c6d6" }}
          >
            {icono}
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border px-3 py-2.5 ${icono ? "pl-10" : ""} text-sm focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-[#93000a] focus:ring-[#93000a]/30"
              : "border-[#303444] focus:border-[#4d8eff] focus:ring-[#4d8eff]/20"
          } ${className}`}
          style={{
            backgroundColor: "#090e1c", // surfaceContainerLowest
            color: "#dee2f6", // onSurface
          }}
          {...resto}
        />
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "#ffb4ab" }}>
          {error}
        </p>
      )}
    </div>
  );
}
