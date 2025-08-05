import { z } from 'zod';
import { BasicSpellItemSchema } from './BasicSpellItem';

export const Parsed5eSpellcastingItemSchema = z.object({
  spells: z.array(BasicSpellItemSchema),
  spellcastingAbility: z.string().optional(),
  spellAttackBonus: z.number().optional(),
  slotsByLevel: z.array(
    z.object({
      level: z.number(),
      count: z.number(),
    }),
  ),
});

export type Parsed5eSpellcastingItem = z.infer<typeof Parsed5eSpellcastingItemSchema>;
