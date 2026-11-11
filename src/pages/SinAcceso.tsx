import { Link } from "react-router-dom";

export default function SinAccesoPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="text-center bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-6xl font-bold text-[#EF4444] mb-4">403</h1>
        <p className="text-[#94A3B8] text-lg mb-8">
          No tienes permisos para ver esta página.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
