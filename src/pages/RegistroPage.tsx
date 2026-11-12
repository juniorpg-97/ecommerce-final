import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus, MapPin } from "lucide-react";
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* ✅ Aumentamos max-w-md a max-w-xl para que quepan los campos de dirección */}
      <div className="w-full max-w-xl">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3B82F6] text-white mb-4 shadow-lg shadow-blue-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">
            Voltix<span className="text-[#3B82F6]">.OS</span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Crea tu cuenta de cliente</p>
        </div>

        {/* Formulario */}
        <div className="bg-[#1E293B] rounded-xl shadow-xl border border-[#334155] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Sección 1: Datos Personales */}
            <div className="space-y-4">
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
            </div>

            {/* ✅ NUEVA SECCIÓN: Dirección de Envío */}
            <div className="space-y-4 pt-4 border-t border-[#334155]">
              <h3 className="text-lg font-semibold text-[#F1F5F9] flex items-center gap-2">
                <MapPin size={20} className="text-[#3B82F6]" />
                Dirección de Envío
              </h3>

              <CampoTexto
                id="calle"
                etiqueta="Calle / Avenida"
                placeholder="Av. Principal"
                icono={<MapPin size={18} />}
                error={errors.calle?.message}
                {...register("calle")}
              />

              <div className="grid grid-cols-2 gap-4">
                <CampoTexto
                  id="numero"
                  etiqueta="Número"
                  placeholder="123"
                  error={errors.numero?.message}
                  {...register("numero")}
                />
                <CampoTexto
                  id="codigoPostal"
                  etiqueta="Código Postal"
                  placeholder="15001"
                  error={errors.codigoPostal?.message}
                  {...register("codigoPostal")}
                />
              </div>

              <CampoTexto
                id="ciudad"
                etiqueta="Ciudad / Distrito"
                placeholder="Lima"
                error={errors.ciudad?.message}
                {...register("ciudad")}
              />

              <div className="space-y-1">
                <label
                  htmlFor="referencia"
                  className="block text-sm font-medium text-[#F1F5F9]"
                >
                  Referencia (opcional)
                </label>
                <textarea
                  id="referencia"
                  rows={2}
                  placeholder="Ej: Frente al parque, casa azul"
                  className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  {...register("referencia")}
                />
                {errors.referencia && (
                  <p className="text-xs text-[#EF4444] mt-1">
                    {errors.referencia.message}
                  </p>
                )}
              </div>
            </div>

            {/* Términos y condiciones */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-[#475569] bg-[#0F172A] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0"
              />
              <span className="text-sm text-[#94A3B8]">
                Acepto los{" "}
                <a
                  href="#"
                  className="text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                >
                  Términos del Servicio
                </a>{" "}
                y la{" "}
                <a
                  href="#"
                  className="text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                >
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
          <div className="mt-6 text-center text-sm text-[#94A3B8]">
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-[#3B82F6] hover:text-[#2563EB] font-semibold hover:underline transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#64748B] mt-6">
          © 2024 Voltix.OS - Sistema de Punto de Venta y E-commerce
        </p>
      </div>
    </div>
  );
}
