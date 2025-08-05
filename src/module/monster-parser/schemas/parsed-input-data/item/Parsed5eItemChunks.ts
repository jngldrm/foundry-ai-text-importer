import { Parsed5eItemSchema } from './Parsed5eItem';

// These are good small "chunks" to parse the item fields in parallel
export const Parsed5eItemChunks = [
  Parsed5eItemSchema.pick({
    name: true,
    type: true,
  }),
  Parsed5eItemSchema.pick({
    actionType: true,
    activation: true,
  }),
  Parsed5eItemSchema.pick({
    duration: true,
  }),
  Parsed5eItemSchema.pick({
    target: true,
  }),
  Parsed5eItemSchema.pick({
    range: true,
  }),
  Parsed5eItemSchema.pick({
    uses: true,
    damage: true,
  }),
  Parsed5eItemSchema.pick({
    save: true,
    recharge: true,
  }),
];
