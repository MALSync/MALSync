import * as hslConverter from 'hex-to-hsl';

export type Hsl = [number, number, number];

export function hexToHsl(hex: string): Hsl {
  return hslConverter(hex);
}

export class HSL {
  constructor(
    protected colorHue: number,
    protected saturation: number,
    protected lightness: number,
  ) {
    con.log('HSL', colorHue, saturation, lightness);
  }

  isDark() {
    return this.lightness < 50;
  }

  hue(percent: number) {
    this.colorHue = this.calculateValue(this.colorHue, percent, 0, 360, false, true);
    return this;
  }

  saturate(percent: number, min = 0, max = 100, bounce = false) {
    this.saturation = this.calculateValue(this.saturation, percent, min, max, bounce);
    return this;
  }

  illuminate(percent: number, min = 0, max = 100, bounce = false) {
    this.lightness = this.calculateValue(this.lightness, percent, min, max, bounce);
    return this;
  }

  toHsl(): Hsl {
    return [this.colorHue, this.saturation, this.lightness];
  }

  copy() {
    return new HSL(this.colorHue, this.saturation, this.lightness);
  }

  protected calculateValue(
    value: number,
    percent: number,
    min: number,
    max: number,
    bounce: boolean,
    overflow = false,
  ) {
    let temp = value;
    temp += percent;
    if (temp > max) {
      if (overflow) {
        return this.calculateValue(temp, 0 - max, min, max, bounce, overflow);
      }
      if (bounce) {
        return this.calculateValue(value, 0 - percent, min, max, false, overflow);
      }
      temp = max;
    }
    if (temp < min) {
      if (overflow) {
        return this.calculateValue(temp, max, min, max, bounce, overflow);
      }
      if (bounce) {
        return this.calculateValue(value, 0 - percent, min, max, false, overflow);
      }
      temp = min;
    }
    return temp;
  }
}
