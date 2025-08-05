import { z } from 'zod';

export const Parsed5eMonsterAbilitySchema = z.object({
  value: z.number(),
  proficient: z.number(),
  bonuses: z
    .object({
      check: z.string(),
      save: z.string(),
    })
    .describe('bonuses to checks and saves'),
});

export type Parsed5eMonsterAbility = z.infer<typeof Parsed5eMonsterAbilitySchema>;

export const Parsed5eMonsterAbilitiesSchema = z.object({
  str: Parsed5eMonsterAbilitySchema,
  dex: Parsed5eMonsterAbilitySchema,
  con: Parsed5eMonsterAbilitySchema,
  int: Parsed5eMonsterAbilitySchema,
  wis: Parsed5eMonsterAbilitySchema,
  cha: Parsed5eMonsterAbilitySchema,
});

export type Parsed5eMonsterAbilities = z.infer<typeof Parsed5eMonsterAbilitiesSchema>;
