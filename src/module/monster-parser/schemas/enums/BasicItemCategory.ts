import { z } from 'zod';

// This represents the sections under the stat block, such as Actions, Legendary Actions, and Special Traits
export const BasicItemCategorySchema = z.enum([
  'specialTrait',
  'action',
  'reaction',
  'legendaryAction',
  'lairAction',
  'crewAction',
  'about',
]);

export type BasicItemCategory = z.infer<typeof BasicItemCategorySchema>;
