import { api } from "../lib/axios";
import type {
  Categoria,
  CategoriaCreacionDTO,
  CategoriaActualizacionDTO,
} from "../types/Categoria";

// ======================================================
// 1. INTERFACES DE LA API (Cómo devuelve los datos el backend)
// ======================================================

// Representa la categoría tal como la devuelve Prisma
interface CategoriaApi {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// Para actualizaciones parciales
interface CategoriaApiUpdate {
  nombre?: string;
  descripcion?: string | null;
  activa?: boolean;
}

// ======================================================
// 2. FUNCIONES MAPEADORAS (Desacoplamiento y Tipado Estricto)
// ======================================================

const convertirCategoria = (categoriaApi: CategoriaApi): Categoria => ({
  id: categoriaApi.id,
  nombre: categoriaApi.nombre,
  descripcion: categoriaApi.descripcion,
  activa: categoriaApi.activa,
  creadoEn: categoriaApi.creadoEn,
  actualizadoEn: categoriaApi.actualizadoEn,
});

// Convierte los datos de actualización del frontend al formato del backend
// (Solo incluye los campos que realmente vienen definidos)
const convertirDatosUpdate = (
  datos: CategoriaActualizacionDTO,
): CategoriaApiUpdate => ({
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
  ...(datos.activa !== undefined && { activa: datos.activa }),
});

// ======================================================
// 3. SERVICIO DE CATEGORÍAS
// ======================================================

export const categoriaService = {
  // A. Obtener todas las categorías (con filtro opcional de estado)
  getAll: async (activa?: boolean): Promise<Categoria[]> => {
    const params: Record<string, boolean> = {};
    if (activa !== undefined) params.activa = activa;

    const respuesta = await api.get<CategoriaApi[]>("/categorias", { params });
    return respuesta.data.map(convertirCategoria);
  },

  // B. Obtener categorías paginadas
  getPagina: async (
    pagina: number,
    porPagina: number,
    activa?: boolean,
  ): Promise<{ categorias: Categoria[]; hayMas: boolean }> => {
    const params: Record<string, string | number | boolean> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (activa !== undefined) params.activa = activa;

    const respuesta = await api.get<CategoriaApi[]>("/categorias", { params });
    const categoriasMapeadas = respuesta.data.map(convertirCategoria);

    return {
      categorias: categoriasMapeadas.slice(0, porPagina),
      hayMas: categoriasMapeadas.length > porPagina,
    };
  },

  // C. Obtener una categoría específica por ID
  getById: async (id: number): Promise<Categoria> => {
    const respuesta = await api.get<CategoriaApi>(`/categorias/${id}`);
    return convertirCategoria(respuesta.data);
  },

  // D. Crear una nueva categoría
  create: async (datos: CategoriaCreacionDTO): Promise<Categoria> => {
    const respuesta = await api.post<CategoriaApi>("/categorias", datos);
    return convertirCategoria(respuesta.data);
  },

  // E. Actualizar una categoría existente (PATCH parcial)
  update: async (
    id: number,
    datos: CategoriaActualizacionDTO,
  ): Promise<Categoria> => {
    const respuesta = await api.patch<CategoriaApi>(
      `/categorias/${id}`,
      convertirDatosUpdate(datos),
    );
    return convertirCategoria(respuesta.data);
  },

  // F. Desactivar una categoría (soft delete)
  desactivar: async (id: number): Promise<Categoria> => {
    const respuesta = await api.patch<CategoriaApi>(`/categorias/${id}`, {
      activa: false,
    });
    return convertirCategoria(respuesta.data);
  },

  // G. Activar una categoría previamente desactivada
  activar: async (id: number): Promise<Categoria> => {
    const respuesta = await api.patch<CategoriaApi>(`/categorias/${id}`, {
      activa: true,
    });
    return convertirCategoria(respuesta.data);
  },

  // H. Eliminar una categoría (hard delete - usar con precaución)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};
