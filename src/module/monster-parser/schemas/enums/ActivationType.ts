import { z } from 'zod';

//Based on DND5E.abilityActivationTypes
export const ActivationTypeEnumSchema = z.enum([
  'action',
  'bonus',
  'reaction',
  'minute',
  'hour',
  'day',
  'special',
  'legendary',
  'mythic',
  'lair',
  'crew',
]);
export type ActivationType = z.infer<typeof ActivationTypeEnumSchema>;
