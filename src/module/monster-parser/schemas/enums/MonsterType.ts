import { z } from 'zod';

export const MonsterTypeEnumSchema = z.enum([
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead',
]);
export type MonsterType = z.infer<typeof MonsterTypeEnumSchema>;
