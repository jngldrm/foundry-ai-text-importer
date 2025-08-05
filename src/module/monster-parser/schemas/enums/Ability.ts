import { z } from 'zod';

export const AbilitySchema = z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']);
export type Ability = z.infer<typeof AbilitySchema>;
