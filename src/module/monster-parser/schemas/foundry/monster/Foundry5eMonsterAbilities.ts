import { z } from 'zod';

const AbilitySchema = z.object({
  value: z.number(),
  proficient: z.number(),
  bonuses: z.object({
    check: z.string(),
    save: z.string(),
  }),
});

export const Foundry5eMonsterAbilitiesSchema = z.object({
  str: AbilitySchema,
  dex: AbilitySchema,
  con: AbilitySchema,
  int: AbilitySchema,
  wis: AbilitySchema,
  cha: AbilitySchema,
});

export type Foundry5eMonsterAbilities = z.infer<typeof Foundry5eMonsterAbilitiesSchema>;
