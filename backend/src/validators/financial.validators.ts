import { z } from 'zod';

// ===== COST VALIDATORS =====

export const createProductCostSchema = z.object({
  productId: z.number().int().positive(),
  cost: z.number().positive(),
  validFrom: z.string().datetime().or(z.date()),
  validUntil: z.string().datetime().or(z.date()).optional().nullable(),
  supplierId: z.number().int().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateProductCostSchema = createProductCostSchema.partial();

export const bulkProductCostSchema = z.object({
  costs: z.array(createProductCostSchema).min(1).max(100),
});

// ===== SUPPLIER VALIDATORS =====

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(255),
  contact: z.string().max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const searchSupplierSchema = z.object({
  query: z.string().min(1),
});

// ===== EXPENSE VALIDATORS =====

export const expenseCategoryEnum = z.enum([
  'labor',
  'rent',
  'utilities',
  'marketing',
  'maintenance',
  'other',
]);

export const createOperatingExpenseSchema = z.object({
  storeId: z.number().int().positive(),
  category: expenseCategoryEnum,
  amount: z.number().positive(),
  period: z.string().datetime().or(z.date()),
  description: z.string().max(500).optional(),
});

export const updateOperatingExpenseSchema = createOperatingExpenseSchema
  .omit({ storeId: true })
  .partial();

export const operatingExpenseFiltersSchema = z.object({
  storeId: z.number().int().positive().optional(),
  category: expenseCategoryEnum.optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const createFixedCostSchema = z.object({
  storeId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  frequency: z.enum(['monthly', 'quarterly', 'annual']),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional().nullable(),
  description: z.string().max(500).optional(),
});

export const updateFixedCostSchema = createFixedCostSchema
  .omit({ storeId: true })
  .partial();

// ===== FINANCIAL VALIDATORS =====

export const dreQuerySchema = z.object({
  storeId: z.number().int().positive(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
});

export const dreCompareQuerySchema = z.object({
  storeId: z.number().int().positive(),
  period1Start: z.string().datetime().or(z.date()),
  period1End: z.string().datetime().or(z.date()),
  period2Start: z.string().datetime().or(z.date()),
  period2End: z.string().datetime().or(z.date()),
});

export const channelProfitabilityQuerySchema = z.object({
  storeId: z.number().int().positive(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  channelId: z.number().int().positive().optional(),
});

export const breakEvenQuerySchema = z.object({
  storeId: z.number().int().positive(),
  period: z.string().datetime().or(z.date()).optional(),
  fixedCosts: z.number().positive().optional(),
  variableCostRate: z.number().min(0).max(100).optional(),
});

export const primeCostQuerySchema = z.object({
  storeId: z.number().int().positive(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
});

// ===== CHANNEL COMMISSION VALIDATORS =====

export const createChannelCommissionSchema = z.object({
  channelId: z.number().int().positive(),
  commissionRate: z.number().min(0).max(100),
  validFrom: z.string().datetime().or(z.date()),
  validUntil: z.string().datetime().or(z.date()).optional().nullable(),
  notes: z.string().max(500).optional(),
});

export const updateChannelCommissionSchema = createChannelCommissionSchema.partial();

// ===== TYPE EXPORTS =====

export type CreateProductCostDTO = z.infer<typeof createProductCostSchema>;
export type UpdateProductCostDTO = z.infer<typeof updateProductCostSchema>;
export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDTO = z.infer<typeof updateSupplierSchema>;
export type CreateOperatingExpenseDTO = z.infer<typeof createOperatingExpenseSchema>;
export type UpdateOperatingExpenseDTO = z.infer<typeof updateOperatingExpenseSchema>;
export type CreateFixedCostDTO = z.infer<typeof createFixedCostSchema>;
export type UpdateFixedCostDTO = z.infer<typeof updateFixedCostSchema>;
export type DREQueryDTO = z.infer<typeof dreQuerySchema>;
export type DRECompareQueryDTO = z.infer<typeof dreCompareQuerySchema>;
export type ChannelProfitabilityQueryDTO = z.infer<typeof channelProfitabilityQuerySchema>;
export type BreakEvenQueryDTO = z.infer<typeof breakEvenQuerySchema>;
export type PrimeCostQueryDTO = z.infer<typeof primeCostQuerySchema>;
