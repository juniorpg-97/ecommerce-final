import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productoService } from "../services/productos";
import { categoriaService } from "../services/categorias";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
import type { ProductoConDetalles } from "../types/Producto";
import type { Categoria } from "../types/Categoria";
import {
  ShoppingCart,
  Package,
  Search,
  AlertCircle,
  Check,
} from "lucide-react";

export default function VitrinaPage() {
  const navigate = useNavigate();
  const agregarProducto = useCarritoClienteStore(
    (state) => state.agregarProducto,
  );
  const contarItems = useCarritoClienteStore((state) => state.contarItems);

  const [productos, setProductos] = useState<ProductoConDetalles[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productoAgregado, setProductoAgregado] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const cats = await categoriaService.getPublicas();
      setCategorias(cats);

      const prods = await productoService.getPublicos();
      setProductos(prods);
    } catch (err: unknown) {
      setError("Error al cargar el catálogo. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // 1. Cargar datos al montar el componente
    cargarDatos();

    // 2. ✅ NUEVO: Refrescar datos automáticamente cuando el usuario vuelve a esta pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        cargarDatos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Limpiar el listener al desmontar
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgregarAlCarrito = (producto: ProductoConDetalles) => {
    const stockReal = producto.inventario?.stock ?? 0;
    agregarProducto({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: Number(producto.precioVenta),
      stockDisponible: stockReal,
    });

    // Feedback visual temporal
    setProductoAgregado(producto.id);
    setTimeout(() => setProductoAgregado(null), 1500);
  };

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
      {/* Hero Section con indicador de carrito */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bienvenido a Voltix.OS</h1>
            <p className="text-blue-100 text-lg">
              Descubre nuestra selección de productos de alta calidad
            </p>
          </div>

          {/* Botón flotante del carrito */}
          <button
            onClick={() => navigate("/checkout")}
            className="relative bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={20} />
            <span>Ver Carrito</span>
            {contarItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {contarItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando catálogo...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

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
                {productosFiltrados.map((producto) => {
                  const stockReal = producto.inventario?.stock ?? 0;
                  const esAgotado = stockReal === 0;
                  const fueAgregado = productoAgregado === producto.id;

                  return (
                    <div
                      key={producto.id}
                      className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
                        esAgotado ? "opacity-75" : ""
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                        <Package size={48} className="text-slate-400" />
                        {esAgotado && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            AGOTADO
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 w-fit mb-2">
                          {producto.categoria.nombre}
                        </span>

                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                          {producto.nombre}
                        </h3>

                        {producto.descripcion && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
                            {producto.descripcion}
                          </p>
                        )}

                        <div className="mt-auto">
                          <p className="text-2xl font-bold text-blue-600 mb-3">
                            $
                            {Number(producto.precioVenta).toLocaleString(
                              "es-MX",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mb-3">
                            Stock disponible:{" "}
                            <span
                              className={
                                esAgotado
                                  ? "text-red-600 font-bold"
                                  : "text-green-600"
                              }
                            >
                              {stockReal}
                            </span>
                          </p>

                          <button
                            disabled={esAgotado}
                            onClick={() => handleAgregarAlCarrito(producto)}
                            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                              fueAgregado
                                ? "bg-green-600 text-white"
                                : esAgotado
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {fueAgregado ? (
                              <>
                                <Check size={18} />
                                <span>¡Agregado!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                <span>
                                  {esAgotado
                                    ? "Sin stock"
                                    : "Agregar al carrito"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
