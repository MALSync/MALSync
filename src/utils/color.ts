import * as hslConverter from 'hex-to-hsl';

export type Hsl = [number, number, number];

export function hexToHsl(hex: string): Hsl {
  return hslConverter(hex);
}

export function illuminate(hsl: Hsl, percent: number, min = 0, max = 100) {
  const newColor = [...hsl];
  newColor[2] += percent;
  if (newColor[2] > max) newColor[2] = max;
  if (newColor[2] < min) newColor[2] = min;
  return newColor as Hsl;
}

export function saturate(hsl: Hsl, percent: number, min = 0, max = 100) {
  const newColor = [...hsl];
  newColor[1] += percent;
  if (newColor[1] > max) newColor[1] = max;
  if (newColor[1] < min) newColor[1] = min;
  return newColor as Hsl;
}

export function hue(hsl: Hsl, percent: number) {
  const newColor = [...hsl];
  newColor[0] += percent;
  if (newColor[1] > 360) newColor[1] -= 360;
  if (newColor[1] < 0) newColor[1] += 360;
  return newColor as Hsl;
}

export function isDark(hsl: Hsl): boolean {
  return hsl[2] < 50;
}
