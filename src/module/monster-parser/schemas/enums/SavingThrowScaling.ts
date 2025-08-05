import { z } from 'zod';

export const SavingThrowScalingEnumSchema = z.enum(['', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'spell', 'flat']);
export type SavingThrowScaling = z.infer<typeof SavingThrowScalingEnumSchema>;
