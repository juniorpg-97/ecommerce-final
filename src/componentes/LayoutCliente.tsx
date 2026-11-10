import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Boton } from "./ui/Boton";
import { ShoppingBag, LogIn, LogOut, User } from "lucide-react";

export default function LayoutCliente() {
  const navigate = useNavigate();
  const autenticado = useAuthStore((s) => s.autenticado);
  const usuarioNombre = useAuthStore((s) => s.usuarioNombre);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Voltix<span className="text-blue-600">.OS</span>
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Tienda
            </Link>
            <Link
              to="/catalogo"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Catálogo
            </Link>
          </nav>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-3">
            {autenticado ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-700">
                  <User size={16} />
                  <span className="font-medium">{usuarioNombre}</span>
                </div>
                <Boton
                  variante="primario"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Salir</span>
                </Boton>
              </>
            ) : (
              <Link to="/login">
                <Boton variante="primario" className="gap-2">
                  <LogIn size={16} />
                  <span>Ingresar</span>
                </Boton>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer simple */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center text-sm text-slate-500">
          © 2024 Voltix.OS - Tienda en línea
        </div>
      </footer>
    </div>
  );
}
