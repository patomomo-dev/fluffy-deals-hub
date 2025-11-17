import { z } from 'zod';

const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
};

export const promotionSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  startDate: z.string().refine(
    val => val >= todayISO(), 
    { message: 'La fecha de inicio debe ser hoy o posterior' }
  ),
  endDate: z.string(),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Categoría requerida'),
  discount: z.number().min(1, 'Descuento mínimo es 1%').max(100, 'Descuento máximo es 100%'),
}).refine(
  data => data.endDate >= data.startDate,
  {
    message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
    path: ['endDate'],
  }
).refine(
  data => data.endDate >= todayISO(),
  {
    message: 'No se puede crear una promoción con fecha de fin en el pasado',
    path: ['endDate'],
  }
);

export type PromotionFormData = z.infer<typeof promotionSchema>;
