import { create } from "zustand";
import { authService } from "../services/auth";
import type { LoginDTO } from "../types/auth";

interface AuthState {
  autenticado: boolean;
  verificandoSesion: boolean;
  usuarioNombre: string;
  usuarioRol: string;
  error: string | null;

  verificarSesion: () => void;
  login: (datos: LoginDTO) => Promise<string>; // ✅ Cambiado a Promise<string>
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  autenticado: Boolean(localStorage.getItem("token")),
  verificandoSesion: Boolean(localStorage.getItem("token")),
  usuarioNombre: localStorage.getItem("usuarioNombre") ?? "",
  usuarioRol: localStorage.getItem("usuarioRol") ?? "",
  error: null,

  verificarSesion: () => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("usuarioNombre") ?? "";
    const rol = localStorage.getItem("usuarioRol") ?? "";

    set({
      autenticado: !!token,
      verificandoSesion: false,
      usuarioNombre: nombre,
      usuarioRol: rol,
      error: null,
    });
  },

  login: async (datos: LoginDTO) => {
    set({ error: null });
    try {
      const respuesta = await authService.login(datos);

      if (!respuesta || !respuesta.token || !respuesta.usuario) {
        throw new Error("Respuesta inválida del servidor");
      }

      const { token, usuario } = respuesta;
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();

      localStorage.setItem("token", token);
      localStorage.setItem("usuarioNombre", nombreCompleto);
      localStorage.setItem("usuarioRol", usuario.rol);

      set({
        autenticado: true,
        verificandoSesion: false,
        usuarioNombre: nombreCompleto,
        usuarioRol: usuario.rol,
        error: null,
      });

      return usuario.rol; // ✅ Retorna el rol
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error de conexión";
      set({ error: mensaje });
      throw new Error(mensaje);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioNombre");
    localStorage.removeItem("usuarioRol");

    set({
      autenticado: false,
      verificandoSesion: false,
      usuarioNombre: "",
      usuarioRol: "",
      error: null,
    });
  },
}));
