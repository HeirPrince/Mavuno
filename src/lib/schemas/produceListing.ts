import { z } from 'zod';
import { RWANDA_DISTRICTS } from '@/lib/rwanda';

export const produceListingSchema = z.object({
  cropName: z.string().min(2, 'Crop name is required'),
  quantityKg: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['kg', 'tons', 'bags']),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  location: z.enum(RWANDA_DISTRICTS, { message: 'Select a district' }),
  qualityGrade: z.string().min(1, 'Quality grade is required'),
  pricePerKgRwf: z.coerce.number().positive('Price must be greater than 0'),
});

export type ProduceListingInput = z.infer<typeof produceListingSchema>;
