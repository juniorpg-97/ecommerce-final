import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Boton } from "./ui/Boton";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function LayoutStaff() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuarioNombre = useAuthStore((s) => s.usuarioNombre);
  const usuarioRol = useAuthStore((s) => s.usuarioRol);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Enlaces según el rol
  const enlacesAdmin = [
    { path: "/dashboard", label: "Dashboard", icono: LayoutDashboard },
    { path: "/productos", label: "Productos", icono: Package },
    { path: "/cajeros", label: "Gestión de Cajeros", icono: Users },
  ];

  const enlacesCajero = [
    { path: "/dashboard", label: "Dashboard", icono: LayoutDashboard },
    { path: "/productos", label: "Productos", icono: Package },
  ];

  const enlaces = usuarioRol === "ADMINISTRADOR" ? enlacesAdmin : enlacesCajero;

  const esActivo = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-100 fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShoppingCart size={20} />
            </div>
            <span className="text-lg font-bold">
              Voltix<span className="text-blue-400">.OS</span>
            </span>
          </Link>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={20} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {usuarioNombre}
              </p>
              <p className="text-xs text-blue-400 font-semibold">
                {usuarioRol}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {enlaces.map((enlace) => {
            const Icono = enlace.icono;
            return (
              <Link
                key={enlace.path}
                to={enlace.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  esActivo(enlace.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icono size={20} />
                <span>{enlace.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Boton
            variante="fantasma"
            onClick={handleLogout}
            anchoCompleto
            className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </Boton>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMenuAbierto(false)}
          ></div>
          <aside className="relative w-64 bg-slate-900 text-slate-100 h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-lg font-bold">Menú</span>
              <button
                onClick={() => setMenuAbierto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {enlaces.map((enlace) => {
                const Icono = enlace.icono;
                return (
                  <Link
                    key={enlace.path}
                    to={enlace.path}
                    onClick={() => setMenuAbierto(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      esActivo(enlace.path)
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icono size={20} />
                    <span>{enlace.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <Boton
                variante="fantasma"
                onClick={handleLogout}
                anchoCompleto
                className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </Boton>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header móvil */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMenuAbierto(true)}
            className="text-slate-700"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold text-slate-900">
            Voltix<span className="text-blue-600">.OS</span>
          </span>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
