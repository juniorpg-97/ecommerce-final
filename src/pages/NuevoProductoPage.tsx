import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { CampoTexto } from "../componentes/ui/CampoTexto";
import { Boton } from "../componentes/ui/Boton";
import { productoService } from "../services/productos";
import { categoriaService } from "../services/categorias";
import { mensajeError } from "../lib/errores";
import { productoSchema, type ProductoFormData } from "../schemas/producto";
import type { Categoria } from "../types/Categoria";

export default function NuevoProductoPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      descripcion: "",
      costoAdquisicion: 0,
      precioVenta: 0,
      categoriaId: 0,
    },
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const cats = await categoriaService.getAll(true);
        setCategorias(cats);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarCategorias();
  }, []);

  const onSubmit = async (datos: ProductoFormData) => {
    try {
      await productoService.create(datos);
      navigate("/productos", { replace: true });
    } catch (err) {
      alert(mensajeError(err, "Error al crear el producto."));
    }
  };

  if (cargando) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto space-y-6 min-h-screen p-6"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/productos")}
          className="p-2 hover:bg-[#1E293B] rounded-lg transition-colors"
          title="Volver"
        >
          <ArrowLeft size={20} className="text-[#94A3B8]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <Package className="text-[#3B82F6]" />
            Nuevo Producto
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Agrega un nuevo producto al catálogo
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <CampoTexto
            id="nombre"
            etiqueta="Nombre del Producto"
            placeholder="Ej: Laptop HP Pavilion"
            error={errors.nombre?.message}
            {...register("nombre")}
          />

          {/* Descripción */}
          <div className="space-y-1">
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-[#F1F5F9]"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={3}
              placeholder="Descripción del producto (opcional)"
              className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-xs text-[#EF4444] mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* Costo y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="costoAdquisicion"
                className="block text-sm font-medium text-[#F1F5F9]"
              >
                Costo de Adquisición ($)
              </label>
              <input
                id="costoAdquisicion"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full rounded-lg border ${
                  errors.costoAdquisicion
                    ? "border-[#EF4444]"
                    : "border-[#334155]"
                } bg-[#0F172A] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                {...register("costoAdquisicion", { valueAsNumber: true })}
              />
              {errors.costoAdquisicion && (
                <p className="text-xs text-[#EF4444] mt-1">
                  {errors.costoAdquisicion.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="precioVenta"
                className="block text-sm font-medium text-[#F1F5F9]"
              >
                Precio de Venta ($)
              </label>
              <input
                id="precioVenta"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`w-full rounded-lg border ${
                  errors.precioVenta ? "border-[#EF4444]" : "border-[#334155]"
                } bg-[#0F172A] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                {...register("precioVenta", { valueAsNumber: true })}
              />
              {errors.precioVenta && (
                <p className="text-xs text-[#EF4444] mt-1">
                  {errors.precioVenta.message}
                </p>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label
              htmlFor="categoriaId"
              className="block text-sm font-medium text-[#F1F5F9]"
            >
              Categoría
            </label>
            <select
              id="categoriaId"
              className={`w-full rounded-lg border ${
                errors.categoriaId ? "border-[#EF4444]" : "border-[#334155]"
              } bg-[#0F172A] px-3 py-2.5 text-sm text-[#F1F5F9] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
              {...register("categoriaId", { valueAsNumber: true })}
            >
              <option value={0} className="bg-[#0F172A]">
                Selecciona una categoría
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0F172A]">
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <p className="text-xs text-[#EF4444] mt-1">
                {errors.categoriaId.message}
              </p>
            )}
          </div>

          {/* Nota informativa */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Información importante</p>
              <p className="mt-1">
                El stock inicial se establecerá en 0. Podrás actualizarlo desde
                la gestión de inventario.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-[#334155]">
            <Boton
              type="submit"
              variante="primario"
              disabled={isSubmitting}
              className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Crear Producto
                </>
              )}
            </Boton>
            <Boton
              type="button"
              variante="fantasma"
              onClick={() => navigate("/productos")}
              className="text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0F172A] transition-all"
            >
              Cancelar
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
