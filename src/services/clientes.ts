import { api } from "../lib/axios";
import type { Cliente, ClienteActualizacionDTO } from "../types/Cliente";

interface ClienteApi {
  id: number;
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    activo: boolean;
  };
}

interface ClienteApiUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  activo?: boolean;
}

const convertirCliente = (cliente: ClienteApi): Cliente => ({
  id: cliente.id,
  usuarioId: cliente.usuarioId,
  nombre: cliente.nombre,
  apellido: cliente.apellido,
  email: cliente.email,
  telefono: cliente.telefono,
  activo: cliente.activo,
  creadoEn: cliente.creadoEn,
  actualizadoEn: cliente.actualizadoEn,
});

const convertirDatosUpdate = (
  datos: ClienteActualizacionDTO,
): ClienteApiUpdate => ({
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.apellido !== undefined && { apellido: datos.apellido }),
  ...(datos.telefono !== undefined && { telefono: datos.telefono }),
  ...(datos.activo !== undefined && { activo: datos.activo }),
});

export const clienteService = {
  getAll: async (activo?: boolean): Promise<Cliente[]> => {
    const params: Record<string, boolean> = {};
    if (activo !== undefined) params.activo = activo;

    const respuesta = await api.get<ClienteApi[]>("/clientes", { params });
    return respuesta.data.map(convertirCliente);
  },

  getPagina: async (
    pagina: number,
    porPagina: number,
    activo?: boolean,
  ): Promise<{ clientes: Cliente[]; hayMas: boolean }> => {
    const params: Record<string, string | number | boolean> = {
      skip: (pagina - 1) * porPagina,
      limit: porPagina + 1,
    };

    if (activo !== undefined) params.activo = activo;

    const respuesta = await api.get<ClienteApi[]>("/clientes", { params });
    const clientesMapeados = respuesta.data.map(convertirCliente);

    return {
      clientes: clientesMapeados.slice(0, porPagina),
      hayMas: clientesMapeados.length > porPagina,
    };
  },

  getById: async (id: number): Promise<Cliente> => {
    const respuesta = await api.get<ClienteApi>(`/clientes/${id}`);
    return convertirCliente(respuesta.data);
  },

  getPerfil: async (): Promise<Cliente> => {
    const respuesta = await api.get<ClienteApi>("/clientes/perfil");
    return convertirCliente(respuesta.data);
  },

  update: async (
    id: number,
    datos: ClienteActualizacionDTO,
  ): Promise<Cliente> => {
    const respuesta = await api.patch<ClienteApi>(
      `/clientes/${id}`,
      convertirDatosUpdate(datos),
    );
    return convertirCliente(respuesta.data);
  },

  desactivar: async (id: number): Promise<Cliente> => {
    const respuesta = await api.patch<ClienteApi>(`/clientes/${id}`, {
      activo: false,
    });
    return convertirCliente(respuesta.data);
  },

  activar: async (id: number): Promise<Cliente> => {
    const respuesta = await api.patch<ClienteApi>(`/clientes/${id}`, {
      activo: true,
    });
    return convertirCliente(respuesta.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
