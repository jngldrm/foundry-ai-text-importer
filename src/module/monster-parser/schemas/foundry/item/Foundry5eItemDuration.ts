import { z } from 'zod';

export const Foundry5eItemDurationSchema = z.object({
  value: z.number().nullable(),
  units: z.string(),
});

export type Foundry5eItemDuration = z.infer<typeof Foundry5eItemDurationSchema>;
