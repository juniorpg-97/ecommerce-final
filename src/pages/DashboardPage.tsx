import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
// ✅ Importamos los servicios exactos que ya tienes
import { productoService } from "../services/productos";
import { ventaService } from "../services/ventas";
import { cajaService } from "../services/caja";

import type { ProductoConDetalles } from "../types/Producto";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

// ✅ Interfaz actualizada para métricas globales y operativas
interface Stats {
  totalVentas: number;
  ingresosTotales: number;
  montoEsperadoCaja: number;
  productosBajoStock: number;
  totalProductos: number;
}

export default function DashboardPage() {
  const usuarioNombre = useAuthStore((s) => s.usuarioNombre);
  const usuarioRol = useAuthStore((s) => s.usuarioRol);

  const [stats, setStats] = useState<Stats>({
    totalVentas: 0,
    ingresosTotales: 0,
    montoEsperadoCaja: 0,
    productosBajoStock: 0,
    totalProductos: 0,
  });

  const [productosBajoStock, setProductosBajoStock] = useState<
    ProductoConDetalles[]
  >([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // ✅ Lógica de carga optimizada con cálculo dinámico de caja
  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Jalamos todos los datos en paralelo
      const [productos, ventas, cajas] = await Promise.all([
        productoService.getAll(),
        ventaService.findAll(), // Trae TODO el historial de ventas
        cajaService.getAll(), // Trae todas las cajas
      ]);

      // Procesamiento local de productos
      const bajoStock = productos.filter((p) => (p.inventario?.stock ?? 0) < 5);

      // Calcular totales globales desde el array completo de ventas
      const totalVentas = ventas.length;
      const montoTotal = ventas.reduce(
        (sum: number, v: any) => sum + Number(v.totalVenta),
        0,
      );

      // ✅ CÁLCULO DINÁMICO DEL MONTO ESPERADO EN TIEMPO REAL
      const cajaAbierta = cajas.find((c: any) => c.estado === "ABIERTA");
      let montoEsperado = 0;

      if (cajaAbierta) {
        // Si la BD ya tiene un valor guardado (ej. caja cerrada/reabierta), lo usamos
        if (cajaAbierta.montoEsperado) {
          montoEsperado = Number(cajaAbierta.montoEsperado);
        } else {
          // Si es null (caja abierta activa), calculamos: Inicial + Ventas POS de esta caja
          const ventasDeEstaCaja = ventas.filter(
            (v: any) => v.cajaId === cajaAbierta.id && v.tipo === "POS",
          );

          const totalVentasPOS = ventasDeEstaCaja.reduce(
            (sum: number, v: any) => sum + Number(v.totalVenta),
            0,
          );

          montoEsperado = Number(cajaAbierta.montoInicial) + totalVentasPOS;
        }
      }

      setStats({
        totalVentas,
        ingresosTotales: montoTotal,
        montoEsperadoCaja: montoEsperado,
        productosBajoStock: bajoStock.length,
        totalProductos: productos.length,
      });

      setProductosBajoStock(bajoStock.slice(0, 5));
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

      {/* ✅ Tarjetas de Estadísticas Actualizadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas Históricas */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="text-[#3B82F6]" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              Histórico
            </span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Total Ventas
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            {stats.totalVentas}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Transacciones registradas
          </p>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="text-[#10B981]" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              Acumulado
            </span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Ingresos Totales
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            S/{" "}
            {stats.ingresosTotales.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Desde el inicio del sistema
          </p>
        </div>

        {/* Monto Esperado (Caja Abierta - Tiempo Real) */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <LayoutDashboard className="text-purple-400" size={24} />
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              Caja Activa
            </span>
          </div>
          <h3 className="text-sm font-medium text-[#94A3B8] mb-1">
            Monto Esperado
          </h3>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            S/{" "}
            {stats.montoEsperadoCaja.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">Según sistema POS</p>
        </div>

        {/* Stock Bajo (Se mantiene igual) */}
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
            Productos con menos de 5 u.
          </p>
        </div>
      </div>

      {/* Accesos Rápidos (Sin cambios) */}
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
          to="/historial-ventas"
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
                <h3 className="font-semibold text-[#F1F5F9]">Cajeros</h3>
                <p className="text-sm text-[#94A3B8]">Gestionar cajeros</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Productos con Stock Bajo (Sin cambios) */}
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
