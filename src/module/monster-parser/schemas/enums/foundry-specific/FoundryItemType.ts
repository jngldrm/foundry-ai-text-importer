import { z } from 'zod';

export const FoundryItemTypeEnumSchema = z.enum(['weapon', 'equipment', 'feat', 'spell']);
export type FoundryItemType = z.infer<typeof FoundryItemTypeEnumSchema>;
