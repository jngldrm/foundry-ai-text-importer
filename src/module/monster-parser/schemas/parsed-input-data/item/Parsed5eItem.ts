import { z } from 'zod';
import { ActivationTypeEnumSchema } from '../../enums/ActivationType';
import { SavingThrowAbilitiesEnumSchema } from '../../enums/SavingThrowAbilities';
import { ActionTypeEnumSchema } from '../../enums/ActionType';
import { ItemTypeEnumSchema } from '../../enums/ItemType';

/**
 * Comprehensive schema for D&D 5e items including all fields needed for proper FoundryVTT import
 */
export const Parsed5eItemSchema = z.object({
  name: z.string(),
  
  // Basic item information
  itemType: z.enum(['weapon', 'equipment', 'consumable', 'tool', 'loot', 'backpack', 'spell']).describe('The main category of this item'),
  itemSubtype: z.string().optional().describe('More specific type (e.g., "longsword", "studded leather", "potion")'),
  
  // Physical properties
  weight: z.object({
    value: z.number().optional().describe('Weight in pounds'),
    units: z.string().default('lb').describe('Weight units, typically "lb"'),
  }).optional(),
  
  price: z.object({
    value: z.number().optional().describe('Price value'),
    denomination: z.enum(['cp', 'sp', 'ep', 'gp', 'pp']).default('gp').describe('Currency denomination'),
  }).optional(),
  
  rarity: z.enum(['common', 'uncommon', 'rare', 'veryRare', 'legendary', 'artifact']).optional().describe('Item rarity level'),
  
  // Weapon-specific properties
  weaponType: z.enum(['simpleM', 'simpleR', 'martialM', 'martialR', 'natural', 'improv']).optional().describe('Weapon proficiency category'),
  baseItem: z.string().optional().describe('Base weapon type (longsword, dagger, etc.)'),
  
  properties: z.array(z.string()).optional().describe('Weapon properties like "versatile", "finesse", "light", "heavy", "reach", "thrown", "two-handed", "ammunition", "loading", "special"'),
  
  // Equipment-specific properties  
  armorClass: z.object({
    value: z.number().optional(),
    dex: z.number().optional().describe('Max dex bonus for armor'),
    magicalBonus: z.number().optional().describe('Magical AC bonus'),
  }).optional(),
  
  equipmentType: z.string().optional().describe('Equipment category like "light", "medium", "heavy", "shield", "clothing", etc.'),
  
  // Magic item properties
  attunement: z.enum(['required', 'optional', '']).default('').describe('Attunement requirement'),
  magicalBonus: z.number().optional().describe('Magical attack/damage bonus for weapons'),
  
  // Item quantities and uses
  quantity: z.number().default(1).describe('Number of items'),
  activation: z.object({
    type: ActivationTypeEnumSchema,
    cost: z.number(),
    condition: z.string().default(''),
  }), // TODO - reexamine adding activation type back, now just passing it through based on how it was identified in the previous step
  actionType: ActionTypeEnumSchema,
  duration: z
    .object({
      value: z.string().describe('a number as a string, e.g. "1"').optional(), // TODO - there is a problem with this field, passing it strings like "Instantaneous" causes error
      units: z.string().describe('e.g. "minute", "hour"').optional(),
    })
    .describe('Duration - empty unless a duration is explicitly specified')
    .optional(),
  // TODO - chunk range together
  target: z
    .object({
      value: z.number().nullable().describe('the size of the target (e.g. for "15 foot cube" the value is 15)'),
      units: z
        .string()
        .default('')
        .describe(
          'the abbreviated units of the target (e.g. for "20 inch sphere" the units are "in". "ft" is another common unit',
        ),
      // width: z.number().nullable(), // omitting width for now
      type: z.string().default('').describe('the shape of the target  (e.g. for "15 foot cube" the shape is "cube")'), //
    })
    .describe('Target - return defaults unless this item covers a certain amount of space of a given shape '),
  range: z
    .object({
      value: z.number().nullable().describe('the range of the item (e.g. for "60/120 feet" the value is 60)'),
      long: z
        .number()
        .optional()
        .describe('the long range of the item (e.g. for "60/120 feet" the value is 120). Exclude if no long range'),
      units: z.string().describe('the units of the range (e.g. for "60/120 feet" the units are "ft")'),
    })
    .optional()
    .describe('leave fields null if no range is described'),
  uses: z
    .object({
      value: z.number().nullable(),
      per: z.string().nullable(),
      recovery: z.string(),
    })
    .optional()
    .describe(
      'how many items the item has, and how they are recovered. E.g. 3/day -> {value: 3, per: "day", recovery: ""}',
    ),
  damage: z.object({
    parts: z
      .array(z.tuple([z.string(), z.string()]))
      .describe(
        'All the parts of damage done (except for versatile damage), with @mod replacing the added number. E.g. "Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) poison damage" => parts is [["1d8 + @mod", "piercing"], ["1d8", "poison"]]. ',
      ),
    versatile: z
      .string()
      .describe(
        'The damage if used with two hands, with the damage type omitted. Leave empty if the two-handed damage is not specified : E.g. "Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands." => versatile is "1d10 + 3"',
      ),
  }),
  save: z
    .object({
      ability: SavingThrowAbilitiesEnumSchema,
      dc: z.number().nullable(),
      // scaling: , Leaving out scaling since it's almost always 'spell' or 'flat'
    })
    .describe(
      'if the target must make a saving throw, the ability and DC of the saving throw. E.g. "DC 13 Dexterity saving throw" => {ability: "dex", dc: 13}',
    )
    .optional(),
  recharge: z
    .number()
    .nullable()
    .describe(
      'only include if "Recharge" is specified. (e.g. "Whirlwind (Recharge 4–6)." => recharge = 4) (e.g. "Recharge 6" => recharge = 5)',
    ),
  // ** Passthrough fields (don't call for these, they get added from example)
  img: z.string().optional(), // Passthrough field from example (or left null)
  flags: z.record(z.unknown()).optional(), // Passthrough field from example (or left null)
  description: z.string(), // Passthrough field from BasicItem
});

export type Parsed5eItem = z.infer<typeof Parsed5eItemSchema>;

// Omitted fields:
// consume: z.object({
//   type: z.string(),
//   target: z.number().nullable(),
//   amount: z.number().nullable(),
// }), //  TODO - add consume
// ability: z.string().nullable(), // TODO - can this be parsed from the text? Not sure
// attackBonus: z.string(), // TODO - I THINK (not positive) this is the unseen adjustment to the attack roll - for example, if the monster should be getting +4 from +2 proficiency and +2 strength, but the text reads +2, this is -2
// chatFlavor: z.string(), // TODO - look at
// critical: z.object({
//   threshold: z.number().nullable(),
//   damage: z.string(),
// }), // TODO - Just default this for now, no examples
// formula: z.string(), // TODO - complicated feature for extraneous formulas, not sure how to handle easily
