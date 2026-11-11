import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { productoService } from "../services/productos";

import type { ProductoConDetalles } from "../types/Producto";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  ventasHoy: number;
  ingresosHoy: number;
  productosBajoStock: number;
  totalProductos: number;
}

export default function DashboardPage() {
  const usuarioNombre = useAuthStore((s) => s.usuarioNombre);
  const usuarioRol = useAuthStore((s) => s.usuarioRol);

  const [stats, setStats] = useState<Stats>({
    ventasHoy: 0,
    ingresosHoy: 0,
    productosBajoStock: 0,
    totalProductos: 0,
  });
  const [productosBajoStock, setProductosBajoStock] = useState<
    ProductoConDetalles[]
  >([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar productos
      const productos = await productoService.getAll();
      const bajoStock = productos.filter((p) => (p.inventario?.stock ?? 0) < 5);

      setStats({
        ventasHoy: 0, // Se actualizará cuando tengamos el endpoint de ventas
        ingresosHoy: 0,
        productosBajoStock: bajoStock.length,
        totalProductos: productos.length,
      });

      setProductosBajoStock(bajoStock.slice(0, 5)); // Mostrar solo los primeros 5
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div
      className="space-y-6 min-h-screen p-6"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <LayoutDashboard className="text-[#3B82F6]" />
            Panel de Control
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {getSaludo()}, {usuarioNombre}. Bienvenido al panel de{" "}
            {usuarioRol.toLowerCase()}.
          </p>
        </div>
        <div className="text-sm text-[#94A3B8]">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas del Día */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="text-[#3B82F6]" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">Hoy</span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Ventas del Día
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">{stats.ventasHoy}</p>
          <p className="text-xs text-[#94A3B8] mt-2">
            <TrendingUp size={12} className="inline text-[#10B981]" /> 0% vs
            ayer
          </p>
        </div>

        {/* Ingresos del Día */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="text-[#10B981]" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">Hoy</span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Ingresos del Día
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            s/{stats.ingresosHoy.toLocaleString("es-PE")}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            <TrendingUp size={12} className="inline text-[#10B981]" /> 0% vs
            ayer
          </p>
        </div>

        {/* Productos Bajo Stock */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="text-amber-400" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">Alerta</span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Stock Bajo
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            {stats.productosBajoStock}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Productos con menos de 5 unidades
          </p>
        </div>

        {/* Total Productos */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Package className="text-purple-400" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">Catálogo</span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Total Productos
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            {stats.totalProductos}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Productos activos en el sistema
          </p>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/productos"
          className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 hover:bg-[#0F172A] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="text-[#3B82F6]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#F1F5F9]">Productos</h3>
              <p className="text-sm text-[#94A3B8]">Gestionar catálogo</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ventas"
          className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 hover:bg-[#0F172A] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShoppingCart className="text-[#10B981]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#F1F5F9]">Ventas</h3>
              <p className="text-sm text-[#94A3B8]">Historial de ventas</p>
            </div>
          </div>
        </Link>

        {usuarioRol === "ADMINISTRADOR" && (
          <Link
            to="/cajeros"
            className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6 hover:bg-[#0F172A] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-[#F1F5F9]">Usuarios</h3>
                <p className="text-sm text-[#94A3B8]">Gestionar cajeros</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Productos con Stock Bajo */}
      {productosBajoStock.length > 0 && (
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#334155] bg-[#0F172A]">
            <h2 className="font-semibold text-[#F1F5F9] flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Productos con Stock Bajo
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0F172A] text-[#F1F5F9] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 text-center">Stock Actual</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {productosBajoStock.map((producto) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-[#0F172A] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#F1F5F9]">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {producto.categoria.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-[#F1F5F9]">
                      {producto.inventario?.stock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          producto.inventario?.stock === 0
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {producto.inventario?.stock === 0
                          ? "Agotado"
                          : "Stock bajo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Cargando datos del panel...</p>
        </div>
      )}
    </div>
  );
}
