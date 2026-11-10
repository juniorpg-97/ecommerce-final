import { Link } from "react-router-dom";

export default function SinAccesoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-slate-600">
          No tienes permisos para ver esta página.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
