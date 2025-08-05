import { z } from 'zod';

export const SizeEnumSchema = z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']);
export type Size = z.infer<typeof SizeEnumSchema>;

export const FoundrySizeEnumSchema = z.enum(['tiny', 'sm', 'med', 'lg', 'huge', 'grg']);
export type FoundrySize = z.infer<typeof FoundrySizeEnumSchema>;

export const sizeToFoundrySize = (size: Size): FoundrySize => {
  switch (size) {
    case 'Tiny':
      return 'tiny';
    case 'Small':
      return 'sm';
    case 'Medium':
      return 'med';
    case 'Large':
      return 'lg';
    case 'Huge':
      return 'huge';
    case 'Gargantuan':
      return 'grg';
  }
};
