import { z } from 'zod';

export const OwnershipSchema = z.object({
  default: z.number(),
});

export const FoundryMonsterStatsSchema = z.object({
  systemId: z.string().nullable(),
  systemVersion: z.string().nullable(),
  coreVersion: z.string().nullable(),
  createdTime: z.number().nullable(),
  modifiedTime: z.number().nullable(),
  lastModifiedBy: z.string().nullable(),
});

export type FoundryMonsterStats = z.infer<typeof FoundryMonsterStatsSchema>;

export const FoundryMonsterSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: z.literal('npc'), // Assuming 'type' is always 'npc'
  img: z.string().optional(),
  effects: z.array(z.unknown()).optional(), // Adjust based on what 'effects' contains
  folder: z.null().optional(),
  sort: z.number().optional(),
  ownership: OwnershipSchema,
  flags: z.record(z.unknown()).optional(), // Adjust based on what 'flags' contains
  _stats: FoundryMonsterStatsSchema.optional(),
});

export type FoundryMonster = z.infer<typeof FoundryMonsterSchema>;
