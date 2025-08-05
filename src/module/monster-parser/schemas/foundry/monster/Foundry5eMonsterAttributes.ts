import { z } from 'zod';

export const Foundry5eMonsterAttributesSchema = z.object({
  ac: z
    .object({
      flat: z.number(),
      calc: z.string(),
      formula: z.string().describe('formula used to calculate the armor class if any, (e.g. 1d6+8, 2d10+2). '), // should be empty string for none
    })
    .describe('the armor class or "AC" for the monster'),
  hp: z.object({
    value: z.number().describe('current hp, should equal max'),
    // min: z.number(),
    max: z.number().describe('max hp, should equal current value'),
    // temp: z.number(),
    // tempmax: z.number(),
    formula: z.string().describe('formula used to calculate hp if any. (e.g. 1d6+8, 2d10+2). '),
  }),
  init: z.object({
    ability: z.string(),
    bonus: z.string(),
  }),
  movement: z.object({
    burrow: z.number(),
    climb: z.number(),
    fly: z.number(),
    swim: z.number(),
    walk: z.number(),
    units: z.string().describe('should default to "ft" if distance in feet'),
    hover: z.boolean(),
  }),
  attunement: z.object({
    max: z.number(),
  }),
  senses: z.object({
    darkvision: z.number(),
    blindsight: z.number(),
    tremorsense: z.number(),
    truesight: z.number(),
    units: z.string(),
    special: z.string().describe('should default to "ft" if distance in feet'),
  }),
  spellcasting: z.string().describe('spellcasting ability if any. '), // should be empty string for none
});

export type Foundry5eMonsterAttributes = z.infer<typeof Foundry5eMonsterAttributesSchema>;
