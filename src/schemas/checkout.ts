import { z } from "zod";

export const checkoutSchema = z.object({
  direccionId: z.number().min(1, "Selecciona una dirección"),
  metodoPago: z.enum([
    "EFECTIVO",
    "TARJETA",
    "TRANSFERENCIA",
    "YAPE",
    "PLIN",
    "OTRO",
    "MOCKPAY",
  ]),
});
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const direccionFormSchema = z.object({
  calle: z.string().min(3, "La calle es requerida"),
  numero: z.string().min(1, "El número es requerido"),
  ciudad: z.string().min(3, "La ciudad es requerida"),
  referencia: z.string().optional(),
  codigoPostal: z.string().optional(),
});
export type DireccionFormData = z.infer<typeof direccionFormSchema>;
