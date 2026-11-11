import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
import { Boton } from "./ui/Boton";
import {
  ShoppingBag,
  LogIn,
  LogOut,
  User,
  ShoppingCart,
  Package,
} from "lucide-react";

export default function LayoutCliente() {
  const navigate = useNavigate();
  const autenticado = useAuthStore((s) => s.autenticado);
  const usuarioNombre = useAuthStore((s) => s.usuarioNombre);
  const logout = useAuthStore((s) => s.logout);

  // Obtener cantidad de items del carrito
  const contarItems = useCarritoClienteStore((s) => s.contarItems);
  const cantidadCarrito = contarItems();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Navbar */}
      <header className="bg-[#0F172A] border-b border-[#334155] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingBag size={20} />
            </div>
            <span className="text-lg font-bold text-[#F1F5F9]">
              Voltix<span className="text-[#3B82F6]">.OS</span>
            </span>
          </Link>

          {/* Navegación Central */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
            >
              Tienda
            </Link>
            {autenticado && (
              <Link
                to="/mis-pedidos"
                className="text-sm font-medium text-[#94A3B8] hover:text-[#3B82F6] transition-colors flex items-center gap-1"
              >
                <Package size={16} />
                Mis Pedidos
              </Link>
            )}
          </nav>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-3">
            {/* Botón del Carrito (siempre visible) */}
            <Link
              to="/checkout"
              className="relative p-2 text-[#94A3B8] hover:text-[#3B82F6] hover:bg-[#1E293B] rounded-lg transition-colors"
              title="Ver carrito"
            >
              <ShoppingCart size={20} />
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cantidadCarrito > 9 ? "9+" : cantidadCarrito}
                </span>
              )}
            </Link>

            {autenticado ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-[#F1F5F9]">
                  <User size={16} className="text-[#94A3B8]" />
                  <span className="font-medium">{usuarioNombre}</span>
                </div>
                <Boton
                  variante="fantasma"
                  onClick={handleLogout}
                  className="gap-2 text-[#EF4444] hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Salir</span>
                </Boton>
              </>
            ) : (
              <Link to="/login">
                <Boton
                  variante="primario"
                  className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Ingresar</span>
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
      <footer className="bg-[#0F172A] border-t border-[#334155] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center text-sm text-[#64748B]">
          © 2024 Voltix.OS - Tienda en línea
        </div>
      </footer>
    </div>
  );
}
