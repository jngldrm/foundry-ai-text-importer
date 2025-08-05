import { z } from 'zod';
import { FoundrySize, FoundrySizeEnumSchema } from '../../enums/Size';

// bypasses example:
const CustomDamageAdjustmentSchema = z.string().default('');

// TODO - this could use some cleaning up but should work for now
export const Foundry5eMonsterTraitsSchema = z.object({
  size: FoundrySizeEnumSchema,
  di: z.object({
    value: z.array(z.string()).describe('damage immunities, e.g. ["poison"]'),
    bypasses: z.array(z.string()).describe('damage immunities that are bypassed, e.g. ["ada", "mgc"]'),
    custom: CustomDamageAdjustmentSchema,
  }),
  dr: z.object({
    value: z.array(z.string()).describe('damage resistances, e.g. ["bludgeoning", "piercing", "slashing"]'),
    bypasses: z.array(z.string()).describe('damage resistances that are bypassed, e.g. ["ada", "mgc"]'),
    custom: CustomDamageAdjustmentSchema,
  }),
  dv: z.object({
    value: z.array(z.string()).describe('damage vulnerabilities, e.g. ["bludgeoning", "piercing", "slashing"]'),
    bypasses: z.array(z.string()).describe('damage vulnerabilities that are bypassed, e.g. ["ada", "mgc"]'),
    custom: CustomDamageAdjustmentSchema,
  }),
  ci: z.object({
    value: z.array(z.string()).describe('condition immunities, e.g. ["exhaustion", "petrified", "poisoned"]'),
    custom: CustomDamageAdjustmentSchema,
  }),
  languages: z.object({
    // TODO - make enum
    value: z.array(z.string()).describe('languages, e.g. ["common", "terran"]'),
    custom: CustomDamageAdjustmentSchema,
  }),
});

export type Foundry5eMonsterTraits = z.infer<typeof Foundry5eMonsterTraitsSchema>;
