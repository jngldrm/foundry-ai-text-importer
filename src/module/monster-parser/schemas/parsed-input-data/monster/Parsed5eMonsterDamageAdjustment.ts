import { z } from 'zod';

const CustomDamageAdjustmentSchema = z.string().default('');

export const Parsed5eMonsterDamageAdjustmentSchema = z.object({
  value: z.array(z.string()).describe('damage immunities, e.g. ["poison"]'),
  // bypasses: z.array(z.string()).describe('damage immunities that are bypassed, e.g. ["ada", "mgc"]'),
  custom: CustomDamageAdjustmentSchema,
});
