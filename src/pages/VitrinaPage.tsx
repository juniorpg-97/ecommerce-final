import { useEffect, useState } from "react";
import { productoService } from "../services/productos";
import { categoriaService } from "../services/categorias";
import type { ProductoConDetalles } from "../types/Producto";
import type { Categoria } from "../types/Categoria";
import { ShoppingCart, Package, Search, AlertCircle } from "lucide-react";

export default function VitrinaPage() {
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
      // ❌ ANTES (requiere autenticación):
      // const cats = await categoriaService.getAll(true);

      // ✅ DESPUÉS (endpoint público):
      const cats = await categoriaService.getPublicas();
      setCategorias(cats);

      // ✅ Endpoint público de productos (sin costo de adquisición):
      const prods = await productoService.getPublicos();
      setProductos(prods);
    } catch (err: unknown) {
      setError("Error al cargar el catálogo. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaFiltro === "todas" ||
      producto.categoria.nombre === categoriaFiltro;
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Bienvenido a Voltix.OS</h1>
          <p className="text-blue-100 text-lg">
            Descubre nuestra selección de productos de alta calidad
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría:
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar:
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Nombre del producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Estado de carga */}
        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando catálogo...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Grid de Productos */}
        {!cargando && !error && (
          <>
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 text-lg">
                  No se encontraron productos disponibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    {/* Imagen placeholder */}
                    <div className="aspect-square bg-slate-100 flex items-center justify-center">
                      <Package size={48} className="text-slate-400" />
                    </div>

                    {/* Contenido */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Categoría */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 w-fit mb-2">
                        {producto.categoria.nombre}
                      </span>

                      {/* Nombre */}
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                        {producto.nombre}
                      </h3>

                      {/* Descripción */}
                      {producto.descripcion && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
                          {producto.descripcion}
                        </p>
                      )}

                      {/* Precio */}
                      <div className="mt-auto">
                        <p className="text-2xl font-bold text-blue-600 mb-3">
                          $
                          {producto.precioVenta.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          })}
                        </p>

                        {/* Botón Agregar al carrito */}
                        <button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          onClick={() =>
                            alert(
                              `Producto "${producto.nombre}" agregado al carrito (pendiente de implementar)`,
                            )
                          }
                        >
                          <ShoppingCart size={18} />
                          <span>Agregar al carrito</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
