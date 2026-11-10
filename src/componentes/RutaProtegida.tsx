import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Rol } from "../types/auth";

interface RutaProtegidaProps {
  rolesPermitidos?: Rol[];
}

export function RutaProtegida({ rolesPermitidos }: RutaProtegidaProps) {
  const autenticado = useAuthStore((s) => s.autenticado);
  const usuarioRol = useAuthStore((s) => s.usuarioRol);
  const verificandoSesion = useAuthStore((s) => s.verificandoSesion);

  if (verificandoSesion) {
    return <p>Verificando sesión...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuarioRol as Rol)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
}
