import type { Tables } from '@/lib/database.types';
import type { ProduceListing } from '@/lib/types';

export function mapProduceListing(row: Tables<'produce_listings'>): ProduceListing & {
  unit: string;
  createdAt: string;
} {
  return {
    id: row.id,
    farmerId: row.farmer_id,
    cropName: row.crop_name,
    quantityKg: Number(row.quantity_kg),
    unit: row.unit,
    qualityGrade: row.quality_grade,
    pricePerKgRwf: Number(row.price_per_kg_rwf),
    harvestDate: row.harvest_date ?? '',
    images: row.images ?? [],
    status: row.status,
    location: row.location ?? row.district ?? '',
    createdAt: row.created_at,
  };
}

export type ActiveListingRow = Tables<'produce_listings'> & {
  profiles: { full_name: string | null; district: string | null; phone: string | null } | null;
};
