import { z } from 'zod';

export const EnvironmentEnumSchema = z.enum([
  'Underdark',
  'Underwater',
  'Urban',
  'Arctic',
  'Coastal',
  'Desert',
  'Forest',
  'Grassland',
  'Hill',
  'Mountain',
  'Swamp',
  '',
]);
