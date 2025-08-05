import { z } from 'zod';

export const SkillEnumSchema = z.enum([
  'Strength',
  'Athletics',
  'Dexterity',
  'Acrobatics',
  'Sleight of Hand',
  'Stealth',
  'Intelligence',
  'Arcana',
  'History',
  'Investigation',
  'Nature',
  'Religion',
  'Wisdom',
  'Animal Handling',
  'Insight',
  'Medicine',
  'Perception',
  'Survival',
  'Charisma',
  'Deception',
  'Intimidation',
  'Performance',
  'Persuasion',
]);
export type Skill = z.infer<typeof SkillEnumSchema>;
