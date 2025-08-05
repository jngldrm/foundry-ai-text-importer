import { z } from 'zod';
import { ActivationType } from '../ActivationType';
import { ActionType } from '../ActionType';

export const FoundryActionTypeEnumSchema = z.enum([
  'other',
  'msak',
  'heal',
  'mwak',
  'abil',
  'rwak',
  'util',
  'rsak',
  'save',
]);
export type FoundryActionType = z.infer<typeof FoundryActionTypeEnumSchema>;

export const FoundryActionTypeFromActionType = (actionType: ActionType): FoundryActionType => {
  switch (actionType) {
    case 'meleeWeaponAttack':
      return 'mwak';
    case 'rangedWeaponAttack':
      return 'rwak';
    case 'meleeSpellAttack':
      return 'msak';
    case 'rangedSpellAttack':
      return 'rsak';
    case 'healing':
      return 'heal';
    case 'ability':
      return 'abil';
    case 'savingThrow':
      return 'save';
    case 'utility':
      return 'util';
  }
};
