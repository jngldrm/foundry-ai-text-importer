import { z } from 'zod';
import { Foundry5eMonsterAbilitiesSchema } from './Foundry5eMonsterAbilities';
import { FoundryMonsterSchema } from './FoundryMonster';
import { Foundry5eMonsterDetailsSchema } from './Foundry5eMonsterDetails';
import { Foundry5eMonsterTraitsSchema } from './Foundry5eMonsterTraits';
import { Foundry5eMonsterCurrencySchema } from './Foundry5eMonsterCurrency';
import { Foundry5eMonsterSkillsSchema } from './Foundry5eMonsterSkills';
import { Foundry5eMonsterSpellsSchema } from './Foundry5eMonsterSpells';
import { Foundry5eMonsterBonusesSchema } from './Foundry5eMonsterBonuses';
import { Foundry5eMonsterResourcesSchema } from './Foundry5eMonsterResources';
import { Foundry5eMonsterAttributesSchema } from './Foundry5eMonsterAttributes';
import { Foundry5eItemSchema } from '../item/Foundry5eItem';

export const Foundry5eMonsterSystemSchema = z.object({
  abilities: Foundry5eMonsterAbilitiesSchema,
  attributes: Foundry5eMonsterAttributesSchema,
  details: Foundry5eMonsterDetailsSchema,
  traits: Foundry5eMonsterTraitsSchema,
  currency: Foundry5eMonsterCurrencySchema,
  skills: Foundry5eMonsterSkillsSchema,
  spells: Foundry5eMonsterSpellsSchema,
  bonuses: Foundry5eMonsterBonusesSchema,
  resources: Foundry5eMonsterResourcesSchema,
});

export type Foundry5eMonsterSystem = z.infer<typeof Foundry5eMonsterSystemSchema>;

export const Foundry5eMonsterSchema = FoundryMonsterSchema.extend({
  system: Foundry5eMonsterSystemSchema,
  items: z.array(Foundry5eItemSchema),
});

export type Foundry5eMonster = z.infer<typeof Foundry5eMonsterSchema>;
