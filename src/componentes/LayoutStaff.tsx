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
  History,
  ClipboardList,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface EnlaceMenu {
  path?: string;
  label: string;
  icono: LucideIcon;
  children?: { path: string; label: string }[];
}

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

  const enlacesAdmin: EnlaceMenu[] = [
    {
      path: "/dashboard",
      label: "Dashboard Ejecutivo",
      icono: LayoutDashboard,
    },
    { path: "/productos", label: "Inventario & Stock", icono: Package },
    { path: "/pos", label: "Terminal POS & Caja", icono: ShoppingCart },
    { path: "/historial-ventas", label: "Historial Ventas", icono: History },
    { path: "/pedidos", label: "Cola de Órdenes", icono: ClipboardList },
    {
      label: "Cajas",
      icono: DollarSign,
      children: [
        { path: "/cajas/abrir", label: "Abrir Caja" },
        { path: "/cajas/cerrar", label: "Cerrar Caja" },
      ],
    },
    { path: "/cajeros", label: "Gestión de Cajeros", icono: Users },
  ];

  const enlacesCajero: EnlaceMenu[] = [
    {
      path: "/dashboard",
      label: "Dashboard Ejecutivo",
      icono: LayoutDashboard,
    },
    { path: "/productos", label: "Inventario & Stock", icono: Package },
    { path: "/pos", label: "Terminal POS & Caja", icono: ShoppingCart },
    { path: "/historial-ventas", label: "Historial Ventas", icono: History },
    { path: "/pedidos", label: "Cola de Órdenes", icono: ClipboardList },
  ];

  const enlaces = usuarioRol === "ADMINISTRADOR" ? enlacesAdmin : enlacesCajero;
  const esActivo = (path: string) => location.pathname === path;

  return (
    // 🔥 CAMBIO CRÍTICO: backgroundColor "#0F172A" en lugar de "#F8FAFC"
    <div className="min-h-screen flex" style={{ backgroundColor: "#0F172A" }}>
      {/* Sidebar Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 fixed h-full border-r z-50"
        style={{ backgroundColor: "#0F172A", borderColor: "#334155" }}
      >
        {/* Logo */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: "#334155" }}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <div
              className="h-7 w-auto flex items-center justify-center"
              style={{ color: "#3B82F6" }}
            >
              <ShoppingCart size={24} />
            </div>
            <div className="leading-none">
              <span
                className="block text-lg font-bold tracking-tight"
                style={{
                  color: "#F1F5F9",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                VOLTIX
              </span>
              <span
                className="block text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: "#3B82F6" }}
              >
                CORE POS
              </span>
            </div>
          </Link>
        </div>

        {/* Perfil de Usuario */}
        <div className="p-3 border-b" style={{ borderColor: "#334155" }}>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: "#1E293B" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "#0F172A",
                border: "1px solid #334155",
              }}
            >
              <User size={18} style={{ color: "#94A3B8" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#F1F5F9" }}
              >
                {usuarioNombre}
              </p>
              <p
                className="text-xs uppercase font-bold truncate"
                style={{ color: "#3B82F6" }}
              >
                {usuarioRol}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="px-2 mb-1.5">
            <p
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: "#64748B" }}
            >
              Operaciones
            </p>
          </div>

          {enlaces.slice(0, 3).map((enlace, index) => {
            if (enlace.children) return null;
            const Icono = enlace.icono;
            const isActive = enlace.path ? esActivo(enlace.path) : false;

            return (
              <Link
                key={enlace.path}
                to={enlace.path || "#"}
                className="flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm font-medium"
                style={{
                  backgroundColor: isActive ? "#1E293B" : "transparent",
                  color: isActive ? "#3B82F6" : "#94A3B8",
                }}
              >
                <Icono size={18} />
                <span>{enlace.label}</span>
              </Link>
            );
          })}

          <div className="px-2 mb-1.5 mt-4">
            <p
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: "#64748B" }}
            >
              Storefront Retail
            </p>
          </div>

          {enlaces.slice(3).map((enlace, index) => {
            if (enlace.children) {
              const Icono = enlace.icono;
              return (
                <div key={index} className="space-y-1 mt-2">
                  <div
                    className="flex items-center gap-2 px-2 py-2 text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: "#64748B" }}
                  >
                    <Icono size={16} />
                    <span>{enlace.label}</span>
                  </div>
                  {enlace.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className="flex items-center gap-2 px-2 py-2 pl-6 rounded-lg transition-all text-sm font-medium"
                      style={{
                        backgroundColor: esActivo(child.path)
                          ? "#1E293B"
                          : "transparent",
                        color: esActivo(child.path) ? "#3B82F6" : "#94A3B8",
                      }}
                    >
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              );
            }

            if (!enlace.path) return null;
            const Icono = enlace.icono;

            return (
              <Link
                key={enlace.path}
                to={enlace.path}
                className="flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm font-medium"
                style={{
                  backgroundColor: esActivo(enlace.path)
                    ? "#1E293B"
                    : "transparent",
                  color: esActivo(enlace.path) ? "#3B82F6" : "#94A3B8",
                }}
              >
                <Icono size={18} />
                <span>{enlace.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Estado de Caja */}
        <div className="p-3 border-t" style={{ borderColor: "#334155" }}>
          <div
            className="flex items-center justify-between p-2 rounded-lg mb-2"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                }}
              ></span>
              <span
                className="text-xs font-semibold"
                style={{ color: "#F1F5F9" }}
              >
                Caja #01: ABIERTA
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal - 🔥 TAMBIÉN AGREGAR FONDO OSCURO */}
      <div
        className="flex-1 lg:ml-64 flex flex-col min-h-screen"
        style={{ backgroundColor: "#0F172A" }}
      >
        {/* Header Móvil */}
        <header
          className="lg:hidden h-14 border-b flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-xl"
          style={{ backgroundColor: "#0F172A", borderColor: "#334155" }}
        >
          <button
            onClick={() => setMenuAbierto(true)}
            style={{ color: "#94A3B8" }}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} style={{ color: "#3B82F6" }} />
            <span
              className="text-base font-bold"
              style={{
                color: "#F1F5F9",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Voltix<span style={{ color: "#3B82F6" }}>.OS</span>
            </span>
          </div>
          <div className="w-6"></div>
        </header>

        {/* Main Content - 🔥 AGREGAR FONDO OSCURO AQUÍ TAMBIÉN */}
        <main
          className="flex-1 p-4 lg:p-6"
          style={{ backgroundColor: "#0F172A" }}
        >
          <Outlet />
        </main>
      </div>

      {/* Sidebar Mobile Overlay */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
          ></div>
          <aside
            className="relative w-64 h-full flex flex-col"
            style={{
              backgroundColor: "#0F172A",
              borderRight: "1px solid #334155",
            }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "#334155" }}
            >
              <span
                className="text-base font-bold"
                style={{ color: "#F1F5F9" }}
              >
                Menú
              </span>
              <button
                onClick={() => setMenuAbierto(false)}
                style={{ color: "#94A3B8" }}
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {enlaces.map((enlace, index) => {
                if (enlace.children) {
                  const Icono = enlace.icono;
                  return (
                    <div key={index} className="space-y-1 mt-2">
                      <div
                        className="flex items-center gap-2 px-2 py-2 text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: "#64748B" }}
                      >
                        <Icono size={16} />
                        <span>{enlace.label}</span>
                      </div>
                      {enlace.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2 px-2 py-2 pl-6 rounded-lg transition-all text-sm font-medium"
                          style={{
                            backgroundColor: esActivo(child.path)
                              ? "#1E293B"
                              : "transparent",
                            color: esActivo(child.path) ? "#3B82F6" : "#94A3B8",
                          }}
                        >
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  );
                }

                if (!enlace.path) return null;
                const Icono = enlace.icono;

                return (
                  <Link
                    key={enlace.path}
                    to={enlace.path}
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm font-medium"
                    style={{
                      backgroundColor: esActivo(enlace.path)
                        ? "#1E293B"
                        : "transparent",
                      color: esActivo(enlace.path) ? "#3B82F6" : "#94A3B8",
                    }}
                  >
                    <Icono size={18} />
                    <span>{enlace.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t" style={{ borderColor: "#334155" }}>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuAbierto(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#EF4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
