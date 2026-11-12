import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { productoService } from "../services/productos";
import { categoriaService } from "../services/categorias";
import { useCarritoClienteStore } from "../store/carritoClienteStore";
import type { ProductoConDetalles } from "../types/Producto";
import type { Categoria } from "../types/Categoria";
import { Package, Search, AlertCircle } from "lucide-react";
import { CardProducto } from "../componentes/CardProducto";

export default function VitrinaPage() {
  const agregarProducto = useCarritoClienteStore(
    (state) => state.agregarProducto,
  );

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
      console.log(" Productos recibidos:", prods);
      setProductos(prods);
    } catch (err: unknown) {
      setError("Error al cargar el catálogo. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        cargarDatos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

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

    setProductoAgregado(producto.id);
    setTimeout(() => setProductoAgregado(null), 1500);
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaFiltro === "todas" ||
        producto.categoria.nombre === categoriaFiltro;
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoriaFiltro, busqueda]);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] text-white py-12 px-4 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bienvenido a Voltix</h1>
            <p className="text-blue-100 text-lg">
              Descubre nuestra selección de productos de alta calidad
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#1E293B] rounded-lg shadow-lg border border-[#334155] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Categoría:
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

            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                Buscar:
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Nombre del producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
            <p className="text-[#94A3B8]">Cargando catálogo...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && (
          <>
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-[#94A3B8] mb-4" />
                <p className="text-[#94A3B8] text-lg">
                  No se encontraron productos disponibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosFiltrados.map((producto) => (
                  <CardProducto
                    key={producto.id}
                    producto={producto}
                    fueAgregado={productoAgregado === producto.id}
                    onAgregar={handleAgregarAlCarrito}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
