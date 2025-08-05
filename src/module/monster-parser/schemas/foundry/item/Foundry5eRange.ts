import { z } from 'zod';

export const Foundry5eRangeSchema = z.object({
  value: z.number().nullable(),
  long: z.number().nullable(),
  units: z.string(),
});

export type Foundry5eRange = z.infer<typeof Foundry5eRangeSchema>;
