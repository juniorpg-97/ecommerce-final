export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegistroDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

// ✅ ACTUALIZADO: Agregamos clienteId como opcional
export interface UsuarioData {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  clienteId?: number | null; // <--- ESTA LÍNEA ES LA QUE FALTABA
}

export interface LoginRespuesta {
  mensaje: string;
  token: string;
  usuario: UsuarioData;
}

export type Rol = "ADMINISTRADOR" | "CAJERO" | "CLIENTE";
