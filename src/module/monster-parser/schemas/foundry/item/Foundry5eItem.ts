import { z } from 'zod';
import { FoundryMonsterStatsSchema, OwnershipSchema } from '../monster/FoundryMonster';
import { ActivationTypeEnumSchema } from '../../enums/ActivationType';
import { FoundryActionTypeEnumSchema } from '../../enums/foundry-specific/FoundryActionType';
import { SavingThrowAbilitiesEnumSchema } from '../../enums/SavingThrowAbilities';
import { Foundry5eItemDurationSchema } from './Foundry5eItemDuration';
import { FoundryItemTypeEnumSchema } from '../../enums/foundry-specific/FoundryItemType';

const PriceSchema = z.object({
  value: z.number().default(0),
  denomination: z.string().default('gp'),
});

export const Foundry5eItemSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  type: FoundryItemTypeEnumSchema, // these should be the types that apply to monsters but more for PCs
  img: z.string(),
  /** Optional fields, consider taking off **/
  effects: z.array(z.string()).optional().default([]),
  folder: z.null().optional(),
  sort: z.number().optional(),
  ownership: OwnershipSchema.optional(),
  flags: z.record(z.unknown()).optional(), // Adjust based on what 'flags' contains
  _stats: FoundryMonsterStatsSchema.optional(),
  /** End optional fields **/
  system: z
    .object({
      /**Optional fields thrown in to get types working */
      // quantity: z.number().default(1).optional(),
      // weight: z.number().default(0).optional(),
      // price: PriceSchema.optional(),
      // attunement: z.number().default(0).optional(),
      // equipped: z.boolean().default(true).optional(),
      // rarity: z.string().default('').optional(),
      // identified: z.boolean().default(true).optional(),
      /** End optional fields */
      description: z.object({
        value: z.string(),
        chat: z.string(),
        unidentified: z.string(),
      }),
      source: z.string(),
      activation: z.object({
        type: ActivationTypeEnumSchema.default('action'),
        cost: z.number().default(1),
        condition: z.string().default(''),
      }),
      duration: Foundry5eItemDurationSchema,
      cover: z.number().nullable(),
      target: z.object({
        value: z.number().nullable(),
        width: z.number().nullable(),
        units: z.string(),
        type: z.string(),
      }),
      range: z.object({
        value: z.number().nullable(),
        long: z.number().nullable(),
        units: z.string(),
      }),
      uses: z.object({
        value: z.number().nullable(),
        max: z.string().nullable(),
        per: z.string().nullable(),
        recovery: z.string(),
      }),
      consume: z.object({
        type: z.string(),
        target: z.number().nullable(),
        amount: z.number().nullable(),
      }),
      ability: z.string().nullable(),
      actionType: FoundryActionTypeEnumSchema,
      attackBonus: z.string(),
      chatFlavor: z.string(),
      critical: z.object({
        threshold: z.number().nullable().default(null),
        damage: z.string().default(''),
      }),
      damage: z.object({
        parts: z.array(z.tuple([z.string(), z.string()])),
        versatile: z.string(),
      }),
      formula: z.string(),
      save: z.object({
        ability: SavingThrowAbilitiesEnumSchema,
        dc: z.number().nullable(),
        scaling: SavingThrowAbilitiesEnumSchema.or(z.enum(['spell', 'flat'])),
      }),
      type: z
        .object({
          value: z.string(),
          subtype: z.string(),
        })
        .optional(),
      requirements: z.string().optional(),
      recharge: z
        .object({
          value: z.number().nullable(),
          charged: z.boolean(),
        })
        .optional(),
    })
    .nonstrict(),
});

export type Foundry5eItem = z.infer<typeof Foundry5eItemSchema>;
