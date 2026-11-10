import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registroSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z
    .string()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe tener al menos una mayúscula y un número",
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistroFormData = z.infer<typeof registroSchema>;
