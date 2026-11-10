import { useEffect, useState } from "react";
import { authService } from "../services/auth";
import { Boton } from "../componentes/ui/Boton";
import { CampoTexto } from "../componentes/ui/CampoTexto";
import {
  Users,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  UserCheck,
} from "lucide-react";
import { mensajeError } from "../lib/errores";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
}

export default function CajerosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);

  // Estados del formulario
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rol, setRol] = useState<"CAJERO" | "ADMINISTRADOR">("CAJERO");
  const [creando, setCreando] = useState<boolean>(false);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError(null);
    try {
      // TODO: Reemplazar con el endpoint real cuando esté disponible
      // const usuariosData = await userService.getAll();
      // setUsuarios(usuariosData);

      // Placeholder: lista vacía por ahora
      setUsuarios([]);
    } catch (err: unknown) {
      setError("Error al cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCreando(true);

    try {
      // Usamos el endpoint de registro, pero pasando el rol
      // TODO: Ajustar si el backend requiere un endpoint diferente para admin
      await authService.register({
        nombre,
        apellido,
        email,
        password,
        rol, // Si el backend no acepta rol, esto fallará y ajustamos
      } as any);

      // Limpiar formulario
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      setRol("CAJERO");
      setMostrarFormulario(false);

      // Recargar lista
      await cargarUsuarios();

      alert(`Usuario ${nombre} ${apellido} creado exitosamente con rol ${rol}`);
    } catch (err: unknown) {
      setError(mensajeError(err, "Error al crear el usuario."));
    } finally {
      setCreando(false);
    }
  };

  const handleEliminarUsuario = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${nombre}?`)) {
      try {
        // TODO: Reemplazar con el endpoint real
        // await userService.delete(id);
        await cargarUsuarios();
        alert("Usuario eliminado (pendiente de implementar endpoint)");
      } catch (err: unknown) {
        alert("Error al eliminar el usuario.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Crea y administra usuarios Cajero y Administrador.
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="gap-2"
        >
          <Plus size={18} />
          <span>{mostrarFormulario ? "Cancelar" : "Nuevo Usuario"}</span>
        </Boton>
      </div>

      {/* Formulario de Creación */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            Crear Nuevo Usuario
          </h2>

          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoTexto
                id="nombre"
                etiqueta="Nombre"
                placeholder="Juan"
                value={nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNombre(e.target.value)
                }
                required
              />
              <CampoTexto
                id="apellido"
                etiqueta="Apellido"
                placeholder="Pérez"
                value={apellido}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setApellido(e.target.value)
                }
                required
              />
            </div>

            <CampoTexto
              id="email"
              etiqueta="Correo Electrónico"
              type="email"
              placeholder="usuario@voltix.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />

            <CampoTexto
              id="password"
              etiqueta="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              minLength={8}
            />

            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rol del Usuario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    rol === "CAJERO"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="CAJERO"
                    checked={rol === "CAJERO"}
                    onChange={() => setRol("CAJERO")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <UserCheck size={16} className="text-blue-600" />
                      Cajero
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Acceso al punto de venta y productos
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    rol === "ADMINISTRADOR"
                      ? "border-purple-600 bg-purple-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="ADMINISTRADOR"
                    checked={rol === "ADMINISTRADOR"}
                    onChange={() => setRol("ADMINISTRADOR")}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <Shield size={16} className="text-purple-600" />
                      Administrador
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Acceso total, incluyendo gestión de usuarios
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <Boton
                type="submit"
                variante="primario"
                disabled={creando}
                className="gap-2"
              >
                {creando ? (
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
                    <Plus size={18} />
                    Crear Usuario
                  </>
                )}
              </Boton>
              <Boton
                type="button"
                variante="fantasma"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </Boton>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Usuarios Registrados</h2>
        </div>

        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-slate-600">Cargando usuarios...</p>
          </div>
        )}

        {error && !cargando && (
          <div className="p-4 text-center text-slate-600">{error}</div>
        )}

        {!cargando && !error && usuarios.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto text-slate-400 mb-4" />
            <p>No hay usuarios registrados aún.</p>
            <p className="text-sm mt-1">
              Haz clic en "Nuevo Usuario" para crear el primero.
            </p>
          </div>
        )}

        {!cargando && !error && usuarios.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.rol === "ADMINISTRADOR"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {usuario.rol === "ADMINISTRADOR" ? (
                          <Shield size={12} />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleEliminarUsuario(
                            usuario.id,
                            `${usuario.nombre} ${usuario.apellido}`,
                          )
                        }
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
