import { z } from 'zod';

const SpellSlotChargesSchema = z.object({
  value: z.number().default(0),
  override: z.union([z.null(), z.string()]).optional().default(null), // or use .nullable() if override is always present but can be null
});

export const Foundry5eMonsterSpellsSchema = z.object({
  spell1: SpellSlotChargesSchema,
  spell2: SpellSlotChargesSchema,
  spell3: SpellSlotChargesSchema,
  spell4: SpellSlotChargesSchema,
  spell5: SpellSlotChargesSchema,
  spell6: SpellSlotChargesSchema,
  spell7: SpellSlotChargesSchema,
  spell8: SpellSlotChargesSchema,
  spell9: SpellSlotChargesSchema,
  pact: SpellSlotChargesSchema,
  spell0: SpellSlotChargesSchema,
});

export type Foundry5eMonsterSpells = z.infer<typeof Foundry5eMonsterSpellsSchema>;
