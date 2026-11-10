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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            Panel de Control
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {getSaludo()}, {usuarioNombre}. Bienvenido al panel de{" "}
            {usuarioRol.toLowerCase()}.
          </p>
        </div>
        <div className="text-sm text-slate-500">
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">Hoy</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">
            Ventas del Día
          </h3>
          <p className="text-2xl font-bold text-slate-900">{stats.ventasHoy}</p>
          <p className="text-xs text-slate-500 mt-2">
            <TrendingUp size={12} className="inline text-green-500" /> 0% vs
            ayer
          </p>
        </div>

        {/* Ingresos del Día */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">Hoy</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">
            Ingresos del Día
          </h3>
          <p className="text-2xl font-bold text-slate-900">
            ${stats.ingresosHoy.toLocaleString("es-MX")}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            <TrendingUp size={12} className="inline text-green-500" /> 0% vs
            ayer
          </p>
        </div>

        {/* Productos Bajo Stock */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">Alerta</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">
            Stock Bajo
          </h3>
          <p className="text-2xl font-bold text-slate-900">
            {stats.productosBajoStock}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Productos con menos de 5 unidades
          </p>
        </div>

        {/* Total Productos */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">Catálogo</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">
            Total Productos
          </h3>
          <p className="text-2xl font-bold text-slate-900">
            {stats.totalProductos}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Productos activos en el sistema
          </p>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/productos"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Productos</h3>
              <p className="text-sm text-slate-600">Gestionar catálogo</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ventas"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Ventas</h3>
              <p className="text-sm text-slate-600">Historial de ventas</p>
            </div>
          </div>
        </Link>

        {usuarioRol === "ADMINISTRADOR" && (
          <Link
            to="/cajeros"
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Usuarios</h3>
                <p className="text-sm text-slate-600">Gestionar cajeros</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Productos con Stock Bajo */}
      {productosBajoStock.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-600" />
              Productos con Stock Bajo
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 text-center">Stock Actual</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productosBajoStock.map((producto) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {producto.categoria.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-semibold">
                      {producto.inventario?.stock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          producto.inventario?.stock === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos del panel...</p>
        </div>
      )}
    </div>
  );
}
