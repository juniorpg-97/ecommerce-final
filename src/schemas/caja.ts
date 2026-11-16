import { z } from "zod";

export const abrirCajaSchema = z.object({
  montoInicial: z.number().min(0, "El monto inicial no puede ser negativo"),
});
export type AbrirCajaFormData = z.infer<typeof abrirCajaSchema>;

export const cerrarCajaSchema = z.object({
  montoContado: z.number().min(0, "El monto contado no puede ser negativo"),
});
export type CerrarCajaFormData = z.infer<typeof cerrarCajaSchema>;
