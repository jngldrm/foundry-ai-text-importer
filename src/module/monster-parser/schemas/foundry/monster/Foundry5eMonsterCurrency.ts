import { z } from 'zod';

export const Foundry5eMonsterCurrencySchema = z.object({
  pp: z.number().default(0),
  gp: z.number().default(0),
  ep: z.number().default(0),
  sp: z.number().default(0),
  cp: z.number().default(0),
});

export type Foundry5eMonsterCurrency = z.infer<typeof Foundry5eMonsterCurrencySchema>;
