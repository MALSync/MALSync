/* eslint-disable no-case-declarations */
/* eslint-disable max-classes-per-file */
// TODO: Delete @ts-expect-error comments after TS will add support for Intl.DurationFormat

type DurationStyle = 'Duration' | 'Progress' | 'M/H/D/Y';

interface DurationFormatOptions {
  style?: 'long' | 'short' | 'narrow' | 'digital' | 'significantLongNarrow' | undefined;
  years?: 'long' | 'short' | 'narrow' | undefined;
  yearsDisplay?: 'auto' | 'always' | undefined;
  months?: 'long' | 'short' | 'narrow' | undefined;
  monthsDisplay?: 'auto' | 'always' | undefined;
  weeks?: 'long' | 'short' | 'narrow' | undefined;
  weeksDisplay?: 'auto' | 'always' | undefined;
  days?: 'long' | 'short' | 'narrow' | undefined;
  daysDisplay?: 'auto' | 'always' | undefined;
  hours?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit' | undefined;
  hoursDisplay?: 'auto' | 'always' | undefined;
  minutes?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit' | undefined;
  minutesDisplay?: 'auto' | 'always' | undefined;
  seconds?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit' | undefined;
  secondsDisplay?: 'auto' | 'always' | undefined;
  milliseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
  millisecondsDisplay?: 'auto' | 'always' | undefined;
  microseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
  microsecondsDisplay?: 'auto' | 'always' | undefined;
  nanoseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
  nanosecondsDisplay?: 'auto' | 'always' | undefined;
  fractionalDigits?: number | undefined;
}

interface DurationFormat {
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

export const dateUnitToMs = {
  years: 365 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
  milliseconds: 1,
} as const;

export class IntlDuration {
  protected duration?: DurationFormat;

  protected locale: Intl.LocalesArgument;

  // @ts-expect-error surely it works
  protected isFallback = !Intl.DurationFormat;

  constructor(locale: Intl.LocalesArgument = api.storage.lang('locale')) {
    this.locale = locale;
    return this;
  }

  setLocale(locale: Intl.LocalesArgument) {
    this.locale = locale;
    return this;
  }

  // For {hours: 2, minutes: 15}
  setDuration(duration: DurationFormat) {
    this.duration = duration;
    return this;
  }

  // For {minutes: 155}
  setDurationFormatted(duration: DurationFormat, style: DurationStyle = 'Duration') {
    const ms = IntlDuration.durationToMs(duration);
    this.setRelativeTime(ms, 'milliseconds', style);
    return this;
  }

  // For 9000 (seconds)
  setRelativeTime(
    relativeTime: number,
    convertFrom: keyof typeof dateUnitToMs,
    style: DurationStyle = 'Duration',
  ) {
    const ms = relativeTime * dateUnitToMs[convertFrom];
    this.duration = this.process(ms, style);
    return this;
  }

  // For 1733320467580 (timestamp)
  setTimestamp(
    timestamp: number,
    style: DurationStyle = 'Duration',
    relativeTo: Date | number = new Date(),
  ) {
    const ms = timestamp - new Date(relativeTo).getTime();
    this.setRelativeTime(ms, 'milliseconds', style);
    return this;
  }

  protected process(relativeTime: number, style: DurationStyle) {
    switch (style) {
      case 'Duration':
        return relativeToDuration(relativeTime, ['seconds', 'minutes', 'hours', 'days']).duration;
      case 'Progress':
        if (!relativeTime) break;
        const time = relativeToDuration(relativeTime, [
          'seconds',
          'minutes',
          'hours',
          'days',
          'years',
        ]);
        return shortTime(time.duration);
      case 'M/H/D/Y':
        if (!relativeTime) break;
        return relativeToDuration(relativeTime, ['minutes', 'hours', 'days', 'years']).duration;
      default:
        return {};
    }
    return {};
  }

  static durationToMs(input: DurationFormat): number {
    const keys = Object.keys(input);
    let timestamp = 0;
    if (keys.length <= 0) return timestamp;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = input[key];
      timestamp += dateUnitToMs[key] * value;
    }
    return timestamp;
  }

  getRelativeText(options: DurationFormatOptions = { style: 'narrow' }): string {
    if (!this.duration) return '';
    if (this.isFallback) return timeToString(this.duration);
    const newOptions: DurationFormatOptions = options;
    if (options.style === 'significantLongNarrow') {
      const keys = Object.keys(dateUnitToMs);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (this.duration[key]) {
          newOptions[key] = 'long';
          newOptions.style = 'narrow';
          break;
        }
      }
    }
    // @ts-expect-error surely it works
    return new Intl.DurationFormat(this.locale, newOptions).format(this.duration);
  }

  getDuration() {
    return this.duration;
  }

  getLocale() {
    return this.locale;
  }
}

export class IntlRange {
  protected from: IntlDateTime;

  protected to: IntlDateTime;

  protected locale: Intl.LocalesArgument;

  constructor(
    from: Date | number | string,
    to: Date | number | string,
    locale: Intl.LocalesArgument = api.storage.lang('locale'),
  ) {
    this.from = new IntlDateTime(from);
    this.to = new IntlDateTime(to);
    this.locale = locale;
    return this;
  }

  getDateTimeRangeText(style: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
    const validFrom = this.from.isValidDate();
    const validTo = this.to.isValidDate();
    if (!validFrom || !validTo) {
      const from = validFrom ? this.from.getDateTimeText() : '?';
      const to = validTo ? this.to.getDateTimeText() : '?';
      return `${from} - ${to}`;
    }
    return new Intl.DateTimeFormat(this.locale, style).formatRange(
      this.from.getDate(),
      this.to.getDate(),
    );
  }
}

export class IntlDateTime {
  protected date: Date;

  protected locale: Intl.LocalesArgument;

  constructor(
    date: Date | number | string,
    locale: Intl.LocalesArgument = api.storage.lang('locale'),
  ) {
    this.locale = locale;
    if (typeof date === 'string') {
      const number = Number(date);
      if (!Number.isNaN(number)) {
        this.date = new Date(number);
        return this;
      }
    }
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

  // Utility
  isValidDate() {
    return isValidDate(this.date);
  }

  isNow() {
    return checkForNow(this.date.getTime());
  }

  isFuture() {
    return this.date.getTime() > Date.now();
  }

  // Getters
  getDate() {
    return this.date;
  }

  getLocale() {
    return this.locale;
  }

  getDateTimeText(options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
    if (!isValidDate(this.date)) return '';
    return new Intl.DateTimeFormat(this.locale, options).format(this.date);
  }

  getRelativeNowText(style: DurationStyle = 'Duration', options?: DurationFormatOptions) {
    if (!this.isValidDate()) return '';
    const relative = new IntlDuration(this.locale);
    relative.setTimestamp(this.date.getTime(), style);
    return relative.getRelativeText(options);
  }

  getRelativeNowFriendlyText(style: DurationStyle = 'Duration', options?: DurationFormatOptions) {
    if (!this.isValidDate()) return '';
    if (this.isNow()) return api.storage.lang('bookmarksItem_now');
    const timeString = this.getRelativeNowText(style, options);
    return this.isFuture() ? timeString : api.storage.lang('bookmarksItem_ago', [timeString]);
  }
}

// Utility for exporting
export function shortTime(time: DurationFormat): DurationFormat {
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

export function relativeToDuration(
  input: number,
  units: (keyof typeof dateUnitToMs)[] = ['minutes', 'hours', 'days', 'years'],
  relativeTo?: Date | number,
): { duration: DurationFormat; isFuture: boolean } {
  const duration: DurationFormat = {};
  const relative = new Date(relativeTo || 0).getTime();
  let time = Math.abs(relative - input);
  const isFuture = input > relative;

  for (const key in dateUnitToMs) {
    if (!units.includes(key as keyof typeof dateUnitToMs)) continue;
    const value = Math.floor(time / dateUnitToMs[key]);
    duration[key] = value;
  }
  const mapKeys = Object.keys(duration);
  for (let i = 1; i < mapKeys.length; i++) {
    const keyPrev = mapKeys[i - 1];
    const valuePrev = duration[keyPrev];
    const keyCurr = mapKeys[i];

    time -= dateUnitToMs[keyPrev] * valuePrev;
    const valueCurr = Math.floor(time / dateUnitToMs[keyCurr]);
    duration[keyCurr] = valueCurr;
  }
  return { duration, isFuture };
}

export function timeToString(time: DurationFormat): string {
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

export function checkForNow(
  input: number,
  relativeTo: Date | number = new Date(),
  threshold: DurationFormat = { seconds: 30 },
): boolean {
  if (Number.isNaN(input)) return false;
  const relativeToTs = new Date(relativeTo).getTime();
  const thresholdTs = IntlDuration.durationToMs(threshold);
  const diff = Math.abs(input - relativeToTs);

  if (diff > thresholdTs) return false;
  return true;
}
