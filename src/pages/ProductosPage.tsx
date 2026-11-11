import { useEffect, useState } from "react";
import { productoService } from "../services/productos";
import { categoriaService } from "../services/categorias";
import type { ProductoConDetalles } from "../types/Producto";
import type { Categoria } from "../types/Categoria";
import { Boton } from "../componentes/ui/Boton";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoConDetalles[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      // Cargar categorías activas para el filtro
      const cats = await categoriaService.getAll(true);
      setCategorias(cats);

      // Cargar productos con sus detalles
      const prods = await productoService.getAll();
      setProductos(prods);
    } catch (err: unknown) {
      setError("Error al cargar los productos. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaFiltro === "todas" ||
      producto.categoria.nombre === categoriaFiltro;
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const handleEliminar = async (id: number) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        await productoService.delete(id);
        await cargarDatos(); // Recargar la lista
      } catch (err: unknown) {
        alert("Error al eliminar el producto.");
      }
    }
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
            <Package className="text-[#3B82F6]" />
            Gestión de Productos
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Administra el catálogo, precios y stock del inventario.
          </p>
        </div>
        <Link to="/productos/nuevo">
          <Boton
            variante="primario"
            className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </Boton>
        </Link>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Filtrar por Categoría:
            </label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm text-[#F1F5F9] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="todas" className="bg-[#0F172A]">
                Todas las categorías
              </option>
              {categorias.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.nombre}
                  className="bg-[#0F172A]"
                >
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Buscar Producto:
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                size={18}
              />
              <input
                type="text"
                placeholder="Nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estado de carga o error */}
      {cargando && (
        <div className="text-center py-12 text-[#94A3B8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-2"></div>
          Cargando productos...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Productos */}
      {!cargando && !error && (
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0F172A] text-[#F1F5F9] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 text-right">Costo Adq.</th>
                  <th className="px-6 py-3 text-right">Precio Venta</th>
                  <th className="px-6 py-3 text-center">Stock</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-[#94A3B8]"
                    >
                      No se encontraron productos{" "}
                      {categoriaFiltro !== "todas" ? "en esta categoría" : ""}.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="hover:bg-[#0F172A] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">
                          {producto.nombre}
                        </div>
                        {producto.descripcion && (
                          <div className="text-[#94A3B8] text-xs mt-1 truncate max-w-xs">
                            {producto.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-[#3B82F6] border border-blue-500/30">
                          {producto.categoria.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[#94A3B8]">
                        S/
                        {producto.costoAdquisicion.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-[#F1F5F9]">
                        S/
                        {producto.precioVenta.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            producto.inventario?.stock === 0
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : producto.inventario &&
                                  producto.inventario.stock < 5
                                ? "bg-orange-500/10 text-[#F97316] border-orange-500/30"
                                : "bg-green-500/10 text-[#10B981] border-green-500/30"
                          }`}
                        >
                          {producto.inventario?.stock ?? 0} un.
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/productos/${producto.id}/editar`}
                            className="p-2 text-[#94A3B8] hover:text-[#3B82F6] hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleEliminar(producto.id)}
                            className="p-2 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
