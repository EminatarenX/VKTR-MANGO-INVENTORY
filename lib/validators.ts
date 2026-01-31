import { z } from 'zod'

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  avgKgPerCrate: z.number().positive('Debe ser un número positivo'),
  minKgPerCrate: z.number().positive().optional().nullable(),
  maxKgPerCrate: z.number().positive().optional().nullable(),
  buyPricePerCrate: z.number().positive('El precio de compra debe ser positivo'),
  sellPricePerCrate: z.number().positive('El precio de venta debe ser positivo'),
})

export const productUpdateSchema = productSchema.partial()

// Movement schemas
export const movementSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  type: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: 'El tipo debe ser IN o OUT' }),
  }),
  crates: z.number().int().positive('Las rejas deben ser un número entero positivo'),
  timestamp: z.string().datetime('Fecha inválida'),
  note: z.string().optional().nullable(),
})

// Movement filters schema
export const movementFiltersSchema = z.object({
  productId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(['IN', 'OUT']).optional(),
})

// Report filters schema
export const reportFiltersSchema = z.object({
  from: z.string().datetime('Fecha inicial inválida'),
  to: z.string().datetime('Fecha final inválida'),
  productId: z.string().uuid().optional(),
})

// Type exports
export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type MovementInput = z.infer<typeof movementSchema>
export type MovementFilters = z.infer<typeof movementFiltersSchema>
export type ReportFilters = z.infer<typeof reportFiltersSchema>
