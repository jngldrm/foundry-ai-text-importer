import { z } from 'zod';

const AttackDamageSchema = z.object({
  attack: z.string(),
  damage: z.string(),
});

export const Foundry5eMonsterBonusesSchema = z.object({
  mwak: AttackDamageSchema,
  rwak: AttackDamageSchema,
  msak: AttackDamageSchema,
  rsak: AttackDamageSchema,
  abilities: z.object({
    check: z.string(),
    save: z.string(),
    skill: z.string(),
  }),
  spell: z.object({
    dc: z.string(),
  }),
});

export type Foundry5eMonsterBonuses = z.infer<typeof Foundry5eMonsterBonusesSchema>;
