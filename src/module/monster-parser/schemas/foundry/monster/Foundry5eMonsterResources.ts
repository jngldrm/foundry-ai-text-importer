import { z } from 'zod';

const numberResourceSchema = z.object({
  value: z.number().default(0),
  max: z.number().default(0),
});

const booleanResourceSchema = z.object({
  value: z.boolean().default(false),
  initiative: z.union([z.null(), z.number()]).optional(), // or use .nullable() if initiative is always present but can be null
});

export const Foundry5eMonsterResourcesSchema = z.object({
  legact: numberResourceSchema,
  legres: numberResourceSchema,
  lair: booleanResourceSchema,
});

export type Foundry5eMonsterResources = z.infer<typeof Foundry5eMonsterResourcesSchema>;
