import { z } from 'zod';

export const ItemTypeEnumSchema = z.enum(['weapon', 'equipment', 'feat']);
export type ItemType = z.infer<typeof ItemTypeEnumSchema>;

// these should be the types that apply to monsters but more for PCs
