import { z } from 'zod';
import { AlignmentEnumSchema } from '../../enums/Alignment';
import { EnvironmentEnumSchema } from '../../enums/Environment';

// TODO - may want to unify things like Biography that have the same structure
const BiographySchema = z.object({
  value: z.string(),
  public: z.string(),
});

const TypeSchema = z.object({
  value: z.string(),
  subtype: z.string(),
  swarm: z.string(),
  custom: z.string(),
});

export const Foundry5eMonsterDetailsSchema = z.object({
  biography: BiographySchema,
  // TODO - I believe these must be hardcoded here rather than from a
  alignment: AlignmentEnumSchema,
  race: z.string(),
  type: TypeSchema,
  // TODO - should environment be fully custom or an enum? having enum for now for simplicity
  environment: EnvironmentEnumSchema,
  cr: z.number().describe('challenge rating - whole number from 1 to 20 or decimal between 0 and 1'),
  spellLevel: z.number().default(0),
  source: z.literal('AI Monster Importer'),
});

export type Foundry5eMonsterDetails = z.infer<typeof Foundry5eMonsterDetailsSchema>;
