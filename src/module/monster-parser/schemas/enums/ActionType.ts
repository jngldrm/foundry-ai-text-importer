import { z } from 'zod';
import { ActivationType } from './ActivationType';

// melee weapon attack -> mwak
//   ranged weapon attack -> rwak
//   melee spell attack -> msak
//   ranged spell attack -> rsak
//   healing -> heal
//   ability -> abil
//   saving throw -> save
//   utility -> util

export const ActionTypeEnumSchema = z.enum([
  'meleeWeaponAttack',
  'rangedWeaponAttack',
  'meleeSpellAttack',
  'rangedSpellAttack',
  'healing',
  'ability',
  'savingThrow',
  'utility',
]);
export type ActionType = z.infer<typeof ActionTypeEnumSchema>;
