import { z } from 'zod';

const skillBonusesSchema = z.object({
  check: z.string(),
  passive: z.string(),
});

const skillSchema = z
  .object({
    value: z.number().default(0),
    ability: z.enum(['dex', 'wis', 'int', 'str', 'cha']),
    bonuses: skillBonusesSchema,
  })
  .optional();

export const Foundry5eMonsterSkillsSchema = z.object({
  acr: skillSchema,
  ani: skillSchema,
  arc: skillSchema,
  ath: skillSchema,
  dec: skillSchema,
  his: skillSchema,
  ins: skillSchema,
  itm: skillSchema,
  inv: skillSchema,
  med: skillSchema,
  nat: skillSchema,
  prc: skillSchema,
  prf: skillSchema,
  per: skillSchema,
  rel: skillSchema,
  slt: skillSchema,
  ste: skillSchema,
  sur: skillSchema,
});

export type Foundry5eMonsterSkills = z.infer<typeof Foundry5eMonsterSkillsSchema>;
