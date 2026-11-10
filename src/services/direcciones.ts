import { api } from "../lib/axios";
import type {
  Direccion,
  DireccionCreacionDTO,
  DireccionActualizacionDTO,
} from "../types/Direccion";

// ======================================================
// 1. INTERFACES DE LA API (Cómo devuelve los datos el backend)
// ======================================================

interface DireccionApi {
  id: number;
  clienteId: number;
  calle: string;
  numero: string;
  referencia: string | null;
  ciudad: string;
  codigoPostal: string;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

interface DireccionApiUpdate {
  calle?: string;
  numero?: string;
  referencia?: string | null;
  ciudad?: string;
  codigoPostal?: string;
  activa?: boolean;
}

// ======================================================
// 2. FUNCIONES MAPEADORAS
// ======================================================

const convertirDireccion = (direccionApi: DireccionApi): Direccion => ({
  id: direccionApi.id,
  clienteId: direccionApi.clienteId,
  calle: direccionApi.calle,
  numero: direccionApi.numero,
  referencia: direccionApi.referencia,
  ciudad: direccionApi.ciudad,
  codigoPostal: direccionApi.codigoPostal,
  activa: direccionApi.activa,
  creadoEn: direccionApi.creadoEn,
  actualizadoEn: direccionApi.actualizadoEn,
});

const convertirDatosUpdate = (
  datos: DireccionActualizacionDTO,
): DireccionApiUpdate => ({
  ...(datos.calle !== undefined && { calle: datos.calle }),
  ...(datos.numero !== undefined && { numero: datos.numero }),
  ...(datos.referencia !== undefined && { referencia: datos.referencia }),
  ...(datos.ciudad !== undefined && { ciudad: datos.ciudad }),
  ...(datos.codigoPostal !== undefined && { codigoPostal: datos.codigoPostal }),
  ...(datos.activa !== undefined && { activa: datos.activa }),
});

// ======================================================
// 3. SERVICIO DE DIRECCIONES
// ======================================================

export const direccionService = {
  // A. Obtener todas las direcciones de un cliente específico
  getByCliente: async (clienteId: number): Promise<Direccion[]> => {
    const respuesta = await api.get<DireccionApi[]>(
      `/direcciones/cliente/${clienteId}`,
    );
    return respuesta.data.map(convertirDireccion);
  },

  // B. Obtener una dirección específica por su ID
  getById: async (id: number): Promise<Direccion> => {
    const respuesta = await api.get<DireccionApi>(`/direcciones/${id}`);
    return convertirDireccion(respuesta.data);
  },

  // C. Crear una nueva dirección para un cliente
  create: async (
    clienteId: number,
    datos: DireccionCreacionDTO,
  ): Promise<Direccion> => {
    // Enviamos el clienteId en el body o como query, dependiendo de cómo lo maneje tu backend.
    // Aquí lo asumimos en el body junto con los datos.
    const respuesta = await api.post<DireccionApi>(`/direcciones`, {
      ...datos,
      clienteId,
    });
    return convertirDireccion(respuesta.data);
  },

  // D. Actualizar una dirección existente (PATCH parcial)
  update: async (
    id: number,
    datos: DireccionActualizacionDTO,
  ): Promise<Direccion> => {
    const respuesta = await api.patch<DireccionApi>(
      `/direcciones/${id}`,
      convertirDatosUpdate(datos),
    );
    return convertirDireccion(respuesta.data);
  },

  // E. Eliminar una dirección (Soft delete: marcar como inactiva)
  desactivar: async (id: number): Promise<Direccion> => {
    const respuesta = await api.patch<DireccionApi>(`/direcciones/${id}`, {
      activa: false,
    });
    return convertirDireccion(respuesta.data);
  },

  // F. Eliminar físicamente (Hard delete)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/direcciones/${id}`);
  },
  getMisDirecciones: async (): Promise<Direccion[]> => {
    const respuesta = await api.get<DireccionApi[]>(
      "/direcciones/mis-direcciones",
    );
    return respuesta.data.map(convertirDireccion);
  },
};
