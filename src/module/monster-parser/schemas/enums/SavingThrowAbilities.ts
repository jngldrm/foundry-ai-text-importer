import { z } from 'zod';

export const SavingThrowAbilitiesEnumSchema = z.enum(['', 'str', 'dex', 'con', 'int', 'wis', 'cha']);
export type SavingThrowAbilities = z.infer<typeof SavingThrowAbilitiesEnumSchema>;
