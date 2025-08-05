import { z } from 'zod';

export const AlignmentEnumSchema = z.enum([
  'Chaotic Evil',
  'Chaotic Neutral',
  'Chaotic Good',
  'Neutral Evil',
  'Neutral',
  'Neutral Good',
  'Lawful Evil',
  'Lawful Neutral',
  'Lawful Good',
]);
