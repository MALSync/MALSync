/* eslint-disable max-classes-per-file */
/* eslint-disable no-case-declarations */
// TODO: Delete @ts-expect-error comments after TS will add support for Intl.DurationFormat

type durationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';
type durationStyle = 'Duration' | 'Progress' | 'M/H/D/Y';
type Rules = 'None' | 'RangeDateTime' | 'RangeDate' | 'RangeTime' | 'DateTime' | 'Date' | 'Time';
interface durationFormat {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  microseconds?: number;
  nanoseconds?: number;
}

const dateUnitToMs = {
  years: 365 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
} as const;

export class IntlDuration {
  protected duration?: durationFormat;

  protected relativeTime?: number;

  protected isFuture = false;

  protected isNow = false;

  protected locale: Intl.LocalesArgument;

  protected durationFormatStyle: durationFormatStyle;

  protected durationStyle: durationStyle;

  // @ts-expect-error surely it works
  protected isFallback = !Intl.DurationFormat;

  constructor(
    input: number | durationFormat = { minutes: 0 },
    style: durationStyle = 'Duration',
    convertFrom?: keyof typeof dateUnitToMs,
    format: durationFormatStyle = 'narrow',
    locale: Intl.LocalesArgument = api.storage.lang('locale'),
  ) {
    if (typeof input === 'number') this.setRelativeTime(input, convertFrom);
    if (typeof input === 'object') this.setDuration(input);
    this.locale = locale;
    this.durationStyle = style;
    this.durationFormatStyle = format;
    return this;
  }

  setLocale(locale: Intl.LocalesArgument) {
    this.locale = locale;
    return this;
  }

  setRelativeTime(relativeTime: number, convertFrom?: keyof typeof dateUnitToMs) {
    this.relativeTime = Number(relativeTime);
    if (convertFrom) this.toTimestamp(convertFrom);
    return this;
  }

  setDuration(duration: durationFormat) {
    this.duration = duration;
    return this;
  }

  setDurationFormatStyle(style: durationFormatStyle) {
    this.durationFormatStyle = style;
    return this;
  }

  setDurationStyle(style: durationStyle) {
    this.durationStyle = style;
    return this;
  }

  protected checkForNow(): boolean {
    if (!this.duration) return false;
    const keys = Object.keys(this.duration);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = this.duration[key];
      if (value !== 0 && key !== 'seconds') return false;
      if (value <= 30 && key === 'seconds') break;
    }
    return true;
  }

  protected transform() {
    switch (this.durationStyle) {
      case 'Duration':
        if (this.relativeTime)
          ({ time: this.duration, isFuture: this.isFuture } = timestampToTime(this.relativeTime));
        break;
      case 'Progress':
        if (this.relativeTime)
          ({ time: this.duration, isFuture: this.isFuture } = timestampToTime(this.relativeTime));
        break;
      case 'M/H/D/Y':
        if (this.relativeTime)
          ({ time: this.duration, isFuture: this.isFuture } = timestampToTime(this.relativeTime));
        break;
      default:
        break;
    }
    return this;
  }

  protected format() {
    switch (this.durationStyle) {
      case 'Duration':
        break;
      case 'Progress':
        if (!this.duration) break;
        this.duration = shortTime(this.duration);
        if (this.checkForNow()) {
          this.isNow = true;
        }
        break;
      case 'M/H/D/Y':
        if (!this.duration) break;
        this.duration = durationToMHDY(this.duration);
        break;
      default:
        break;
    }

    return this;
  }

  static toTimestamp(time: number, from: keyof typeof dateUnitToMs): number {
    return Date.now() + time * dateUnitToMs[from];
  }

  toTimestamp(from: keyof typeof dateUnitToMs) {
    if (!this.relativeTime) return this;
    this.relativeTime = Date.now() + this.relativeTime * dateUnitToMs[from];
    return this;
  }

  getText(): string {
    this.transform().format();
    if (!this.duration) return '';
    if (this.isNow) return api.storage.lang('bookmarksItem_now');
    if (this.isFallback) return timeToString(this.duration);
    // @ts-expect-error surely it works
    return new Intl.DurationFormat(this.locale, { style: this.durationFormatStyle }).format(
      this.duration,
    );
  }

  getRelativeTime() {
    return this.relativeTime;
  }

  getDuration() {
    return this.duration;
  }

  getIsFuture() {
    return this.isFuture;
  }

  getIsNow() {
    return this.isNow;
  }

  getLocale() {
    return this.locale;
  }

  getDurationFormatStyle() {
    return this.durationFormatStyle;
  }

  getDurationStyle() {
    return this.durationStyle;
  }
}

export class IntlRange {
  protected from: IntlDateTime;

  protected to: IntlDateTime;

  protected text: string = '';

  protected locale: Intl.LocalesArgument;

  protected dateTimeFormatStyle: Intl.DateTimeFormatOptions;

  constructor(
    from: Date | number | string,
    to: Date | number | string,
    style: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
    locale: Intl.LocalesArgument = api.storage.lang('locale'),
  ) {
    this.from = new IntlDateTime(from);
    this.to = new IntlDateTime(to);
    this.dateTimeFormatStyle = style;
    this.locale = locale;
    return this;
  }

  setStyle(style: Intl.DateTimeFormatOptions) {
    this.dateTimeFormatStyle = style;
    return this;
  }

  protected getDateTimeRangeText(
    from: Date | number,
    to: Date | number,
    style: Intl.DateTimeFormatOptions | undefined = undefined,
  ) {
    return new Intl.DateTimeFormat(this.locale, style).formatRange(from, to);
  }

  protected format() {
    const validFrom = this.from.isValidDate();
    const validTo = this.to.isValidDate();
    if (!validFrom || !validTo) {
      const from = validFrom ? this.from.getText() : '?';
      const to = validTo ? this.to.getText() : '?';
      this.text = `${from} - ${to}`;
      return this;
    }
    this.text = this.getDateTimeRangeText(
      this.from.getDate(),
      this.to.getDate(),
      this.dateTimeFormatStyle,
    );

    return this;
  }

  getText() {
    this.format();
    return this.text;
  }
}

export class IntlDateTime {
  // Output variables
  protected text: string = '';

  // Input variables
  protected date: Date | number;

  protected locale: Intl.LocalesArgument;

  protected dateTimeFormatStyle: Intl.DateTimeFormatOptions;

  constructor(
    date: Date | number | string = new Date(),
    style: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
    locale: Intl.LocalesArgument = api.storage.lang('locale'),
  ) {
    this.locale = locale;
    this.dateTimeFormatStyle = style;
    this.date = new Date(date);
    return this;
  }

  // Setters
  setDate(date: Date | number | string) {
    this.date = new Date(date);
    return this;
  }

  setLocale(locale: Intl.LocalesArgument) {
    this.locale = locale;
    return this;
  }

  setStyle(options: Intl.DateTimeFormatOptions) {
    this.dateTimeFormatStyle = options;
    return this;
  }

  // Processing
  protected format() {
    if (!isValidDate(this.date)) this.text = '';
    else this.text = this.getDateTimeText(this.date, this.dateTimeFormatStyle);
    return this;
  }

  // Intl wrapper functions
  protected getDateTimeText(
    date: Date | number,
    style: Intl.DateTimeFormatOptions | undefined = undefined,
  ) {
    return new Intl.DateTimeFormat(this.locale, style).format(date);
  }

  // Utility
  isValidDate() {
    return isValidDate(this.date);
  }

  // Getters
  getDate() {
    return this.date;
  }

  getLocale() {
    return this.locale;
  }

  getStyle() {
    return this.dateTimeFormatStyle;
  }

  getRelative(
    input: number | durationFormat,
    style: durationStyle = 'Duration',
    convertFrom?: keyof typeof dateUnitToMs,
    format?: durationFormatStyle,
  ) {
    const duration = new IntlDuration(input, style, convertFrom, format, this.locale);
    return duration.getText();
  }

  getText() {
    this.format();
    return this.text;
  }

  getRange(from: Date | number | string, to: Date | number | string) {
    const range = new IntlRange(from, to, this.dateTimeFormatStyle, this.locale);
    return range.getText();
  }
}

// Utility for exporting
export function shortTime(time: durationFormat): durationFormat {
  let totalDays = time.days || 0;
  if (time.years) {
    if (time.years > 1) {
      if (time.days && time.days > 182) {
        return {
          years: time.years + 1,
        };
      }
      return {
        years: time.years,
      };
    }
    return {
      years: time.years,
      days: time.days,
    };
  }
  if (time.months || time.weeks) {
    totalDays += time.months ? time.months * 30 : 0;
    totalDays += time.weeks ? time.weeks * 7 : 0;
  }
  if (totalDays) {
    if (totalDays > 3) {
      if (time.hours && time.hours > 11) {
        return {
          days: totalDays + 1,
        };
      }
      return {
        days: totalDays,
      };
    }
    return {
      days: totalDays,
      hours: time.hours,
    };
  }
  if (time.hours) {
    if (time.hours > 5) {
      if (time.minutes && time.minutes > 29) {
        return {
          hours: time.hours + 1,
        };
      }
      return {
        hours: time.hours,
      };
    }
    return {
      hours: time.hours,
      minutes: time.minutes,
    };
  }
  if (time.minutes && time.minutes > 14) {
    return {
      minutes: time.minutes,
    };
  }
  return {
    minutes: time.minutes || 0,
    seconds: time.seconds || 0,
  };
}

export function timestampToTime(timestamp: number): { time: durationFormat; isFuture: boolean } {
  const map: durationFormat = {};
  const isFuture = timestamp > Date.now();
  let timestampAbs = Math.abs(timestamp - Date.now());

  for (const key in dateUnitToMs) {
    const value = Math.floor(timestampAbs / dateUnitToMs[key]);
    map[key] = value;
  }
  const mapKeys = Object.keys(map);
  for (let i = 1; i < mapKeys.length; i++) {
    const keyPrev = mapKeys[i - 1];
    const valuePrev = map[keyPrev];
    const keyCurr = mapKeys[i];

    timestampAbs -= dateUnitToMs[keyPrev] * valuePrev;
    const valueCurr = Math.floor(timestampAbs / dateUnitToMs[keyCurr]);
    map[keyCurr] = valueCurr;
  }
  return { time: map, isFuture };
}

export function timeToString(time: durationFormat): string {
  let output = '';

  if (time.years) {
    if (time.years === 1) output += ` ${time.years} ${api.storage.lang('bookmarksItem_Year')}`;
    else output += ` ${time.years} ${api.storage.lang('bookmarksItem_Years')}`;
  }
  if (time.days) {
    if (time.days === 1) output += ` ${time.days} ${api.storage.lang('bookmarksItem_Day')}`;
    else output += ` ${time.days} ${api.storage.lang('bookmarksItem_Days')}`;
  }
  if (time.hours) {
    if (time.hours === 1) output += ` ${time.hours} ${api.storage.lang('bookmarksItem_Hour')}`;
    else output += ` ${time.hours} ${api.storage.lang('bookmarksItem_Hours')}`;
  }
  if (time.minutes) {
    if (time.minutes === 1) output += ` ${time.minutes} ${api.storage.lang('bookmarksItem_min')}`;
    else output += ` ${time.minutes} ${api.storage.lang('bookmarksItem_mins')}`;
  }
  if (time.seconds) {
    if (time.seconds === 1) output += ` ${time.seconds} ${api.storage.lang('bookmarksItem_sec')}`;
    else output += ` ${time.seconds} ${api.storage.lang('bookmarksItem_secs')}`;
  }

  return output.trim();
}

export function isValidDate(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  if (typeof date === 'number') return true;
  const str = typeof date === 'string' ? new Date(date) : date;
  return str instanceof Date && !Number.isNaN(str.getTime());
}

export function durationToMHDY(duration: durationFormat): durationFormat {
  const res = shortTime(duration);
  return {
    years: res.years || 0,
    days: res.days || 0,
    hours: res.hours || 0,
    minutes: res.minutes || 0,
  } as durationFormat;
}
