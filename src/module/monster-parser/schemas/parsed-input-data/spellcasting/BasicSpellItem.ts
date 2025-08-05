import { z } from 'zod';

const BasicSpellLevelSchema = z.enum(['Cantrip', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

export const BasicSpellItemSchema = z.object({
  name: z.string(),
  level: BasicSpellLevelSchema,
  atWill: z.boolean().optional().describe('only if specified'),
  perDay: z.number().optional().describe('only if "per day" is specified, do not include slots'),
});

export type BasicSpellItem = z.infer<typeof BasicSpellItemSchema>;
