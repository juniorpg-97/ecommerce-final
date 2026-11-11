import { Navigate, useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoTexto } from "../componentes/ui/CampoTexto";
import { Boton } from "../componentes/ui/Boton";
import { useAuthStore } from "../store/authStore";
import { loginSchema, type LoginFormData } from "../schemas/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const autenticado = useAuthStore((s) => s.autenticado);
  const usuarioRol = useAuthStore((s) => s.usuarioRol);
  const errorStore = useAuthStore((s) => s.error);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (autenticado) {
    if (usuarioRol === "ADMINISTRADOR" || usuarioRol === "CAJERO") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (datos: LoginFormData) => {
    try {
      const rol = await login(datos);

      if (rol === "ADMINISTRADOR" || rol === "CAJERO") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      // El error ya se maneja en el store
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3B82F6] text-white mb-4 shadow-lg shadow-blue-500/20">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">
            Voltix<span className="text-[#3B82F6]">.OS</span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <div className="bg-[#1E293B] rounded-xl shadow-xl border border-[#334155] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              placeholder="••••••••"
              icono={<Lock size={18} />}
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {errorStore && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errorStore}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0"
                />
                <span className="text-[#94A3B8]">Recordarme</span>
              </label>
              <a
                href="#"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Boton
              type="submit"
              variante="primario"
              anchoCompleto
              disabled={isSubmitting}
              className="h-12 text-base bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
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
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Iniciar Sesión
                </span>
              )}
            </Boton>
          </form>

          <div className="mt-6 text-center text-sm text-[#94A3B8]">
            <p>
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#3B82F6] hover:text-[#2563EB] font-semibold hover:underline transition-colors"
              >
                Regístrate como cliente
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          © 2024 Voltix.OS - Sistema de Punto de Venta y E-commerce
        </p>
      </div>
    </div>
  );
}
