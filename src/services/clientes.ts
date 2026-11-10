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

// Para actualizaciones parciales
interface ClienteApiUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  activo?: boolean;
}

// ======================================================
// 2. FUNCIONES MAPEADORAS (Desacoplamiento y Tipado Estricto)
// ======================================================

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

// Solo incluye los campos que realmente vienen definidos para evitar enviar "undefined"
const convertirDatosUpdate = (
  datos: ClienteActualizacionDTO,
): ClienteApiUpdate => ({
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.apellido !== undefined && { apellido: datos.apellido }),
  ...(datos.telefono !== undefined && { telefono: datos.telefono }),
  ...(datos.activo !== undefined && { activo: datos.activo }),
});

// ======================================================
// 3. SERVICIO DE CLIENTES
// ======================================================

export const clienteService = {
  // A. Obtener todos los clientes (con filtro opcional de estado)
  getAll: async (activo?: boolean): Promise<Cliente[]> => {
    const params: Record<string, boolean> = {};
    if (activo !== undefined) params.activo = activo;

    const respuesta = await api.get<ClienteApi[]>("/clientes", { params });
    return respuesta.data.map(convertirCliente);
  },

  // B. Obtener clientes paginados (para el dashboard de admin)
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

  // C. Obtener un cliente específico por ID
  getById: async (id: number): Promise<Cliente> => {
    const respuesta = await api.get<ClienteApi>(`/clientes/${id}`);
    return convertirCliente(respuesta.data);
  },

  // D. Obtener el perfil del cliente actual (el usuario logueado)
  getPerfil: async (): Promise<Cliente> => {
    const respuesta = await api.get<ClienteApi>("/clientes/perfil");
    return convertirCliente(respuesta.data);
  },

  // E. Actualizar datos del cliente (PATCH parcial)
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

  // F. Desactivar cliente (soft delete)
  desactivar: async (id: number): Promise<Cliente> => {
    const respuesta = await api.patch<ClienteApi>(`/clientes/${id}`, {
      activo: false,
    });
    return convertirCliente(respuesta.data);
  },

  // G. Activar cliente previamente desactivado
  activar: async (id: number): Promise<Cliente> => {
    const respuesta = await api.patch<ClienteApi>(`/clientes/${id}`, {
      activo: true,
    });
    return convertirCliente(respuesta.data);
  },

  // H. Eliminar cliente físicamente (hard delete - usar con precaución)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
