import { z } from 'zod';

const barSchema = z.object({
  attribute: z.union([z.string(), z.null()]),
});

const lightAnimationSchema = z.object({
  speed: z.number(),
  intensity: z.number(),
  type: z.union([z.string(), z.null()]),
  reverse: z.boolean(),
});

const lightDarknessSchema = z.object({
  min: z.number(),
  max: z.number(),
});

const lightSchema = z.object({
  alpha: z.number(),
  angle: z.number(),
  bright: z.number(),
  coloration: z.number(),
  dim: z.number(),
  luminosity: z.number(),
  saturation: z.number(),
  contrast: z.number(),
  shadows: z.number(),
  animation: lightAnimationSchema,
  darkness: lightDarknessSchema,
  color: z.union([z.string(), z.null()]),
  attenuation: z.number(),
});

const textureSchema = z.object({
  src: z.string(),
  tint: z.union([z.string(), z.null()]),
  scaleX: z.number(),
  scaleY: z.number(),
  offsetX: z.number(),
  offsetY: z.number(),
  rotation: z.number(),
});

const sightSchema = z.object({
  angle: z.number(),
  enabled: z.boolean(),
  range: z.number(),
  brightness: z.number(),
  visionMode: z.enum(['basic']), // Add other modes if available
  color: z.union([z.string(), z.null()]),
  attenuation: z.number(),
  saturation: z.number(),
  contrast: z.number(),
});

export const FoundryPrototypeTokenSchema = z.object({
  name: z.string(),
  displayName: z.number(),
  actorLink: z.boolean(),
  width: z.number(),
  height: z.number(),
  lockRotation: z.boolean(),
  rotation: z.number(),
  disposition: z.number(),
  displayBars: z.number(),
  bar1: barSchema,
  bar2: barSchema,
  flags: z.record(z.any()),
  randomImg: z.boolean(),
  alpha: z.number(),
  light: lightSchema,
  texture: textureSchema,
  sight: sightSchema,
  detectionModes: z.array(z.any()), // Specify the type of elements if known
});

// Example usage:
const myData = {
  // ... your object data here ...
};
const parsedData = prototypeTokenSchema.parse(myData);
