import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoTexto } from "../componentes/ui/CampoTexto";
import { Boton } from "../componentes/ui/Boton";
import { authService } from "../services/auth";
import { mensajeError } from "../lib/errores";
import { registroSchema, type RegistroFormData } from "../schemas/auth";

export default function RegistroPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  });

  const onSubmit = async (datos: RegistroFormData) => {
    try {
      await authService.register(datos);
      navigate("/login", {
        replace: true,
        state: { mensaje: "Registro exitoso. Ahora inicia sesión." },
      });
    } catch (err) {
      alert(mensajeError(err, "Error al registrarse. Intenta de nuevo."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Voltix<span className="text-blue-600">.OS</span>
          </h1>
          <p className="text-slate-600 mt-2">Crea tu cuenta de cliente</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <CampoTexto
                id="nombre"
                etiqueta="Nombre"
                placeholder="Carlos"
                icono={<User size={18} />}
                error={errors.nombre?.message}
                {...register("nombre")}
              />
              <CampoTexto
                id="apellido"
                etiqueta="Apellido"
                placeholder="Vega"
                icono={<User size={18} />}
                error={errors.apellido?.message}
                {...register("apellido")}
              />
            </div>

            <CampoTexto
              id="email"
              etiqueta="Correo Electrónico"
              type="email"
              placeholder="usuario@voltix.com"
              icono={<Mail size={18} />}
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <CampoTexto
              id="password"
              etiqueta="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
              icono={<Lock size={18} />}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Términos y condiciones */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                Acepto los{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Términos del Servicio
                </a>{" "}
                y la{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Política de Privacidad
                </a>
              </span>
            </label>

            {/* Botón de registro */}
            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={isSubmitting}
              className="h-12 text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Registrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Crear Cuenta
                </span>
              )}
            </Boton>
          </form>

          {/* Enlace a login */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 Voltix.OS - Sistema de Punto de Venta y E-commerce
        </p>
      </div>
    </div>
  );
}
