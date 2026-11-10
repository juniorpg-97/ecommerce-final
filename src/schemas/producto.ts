import { z } from "zod";

export const productoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    descripcion: z.string().min(0),
    costoAdquisicion: z.number().min(0, "El costo debe ser mayor o igual a 0"),
    precioVenta: z.number().min(0.01, "El precio debe ser mayor a 0"),
    categoriaId: z.number().min(1, "Debes seleccionar una categoría"),
  })
  .refine((data) => data.precioVenta > data.costoAdquisicion, {
    message: "El precio de venta debe ser mayor al costo de adquisición",
    path: ["precioVenta"],
  });

export type ProductoFormData = z.infer<typeof productoSchema>;
