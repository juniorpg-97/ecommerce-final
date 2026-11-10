import { api } from "../lib/axios";
import type { Categoria } from "../types/Categoria";

export const categoriaService = {
  getAll: async (activa?: boolean) => {
    const params = activa !== undefined ? { activa: activa.toString() } : {};
    const respuesta = await api.get<Categoria[]>("/categorias", { params });
    return respuesta.data;
  },

  // ✅ AGREGA ESTE MÉTODO:
  getPublicas: async (): Promise<Categoria[]> => {
    const respuesta = await api.get<Categoria[]>("/categorias/publicas");
    return respuesta.data;
  },

  getById: async (id: number) => {
    const respuesta = await api.get<Categoria>(`/categorias/${id}`);
    return respuesta.data;
  },

  create: async (data: Omit<Categoria, "id">) => {
    const respuesta = await api.post<Categoria>("/categorias", data);
    return respuesta.data;
  },

  update: async (id: number, data: Partial<Categoria>) => {
    const respuesta = await api.patch<Categoria>(`/categorias/${id}`, data);
    return respuesta.data;
  },

  delete: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  },
};
