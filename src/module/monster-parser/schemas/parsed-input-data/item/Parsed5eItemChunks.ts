import { Parsed5eItemSchema } from './Parsed5eItem';

// These are good small "chunks" to parse the item fields in parallel
export const Parsed5eItemChunks: any[] = [
  (Parsed5eItemSchema as any).pick({
    name: true,
    type: true,
  }),
  (Parsed5eItemSchema as any).pick({
    actionType: true,
    activation: true,
  }),
  (Parsed5eItemSchema as any).pick({
    duration: true,
  }),
  (Parsed5eItemSchema as any).pick({
    target: true,
  }),
  (Parsed5eItemSchema as any).pick({
    range: true,
  }),
  (Parsed5eItemSchema as any).pick({
    uses: true,
    damage: true,
  }),
  (Parsed5eItemSchema as any).pick({
    save: true,
    recharge: true,
  }),
];
