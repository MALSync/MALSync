/* eslint-disable max-classes-per-file */
// TODO: Delete @ts-expect-error comments after TS will add support for Intl.DurationFormat

type durationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';
type durationStyle = 'Duration' | 'Progress' | 'M/H/D/Y';

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
  milliseconds: 1,
} as const;

export class IntlDuration {
  protected duration?: durationFormat;

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
  setDuration(duration: durationFormat, style: durationStyle = 'Duration') {
    this.duration = duration;
    this.process(style);
    return this;
  }

  // For {minutes: 155}
  setDurationFormatted(duration: durationFormat, style: durationStyle = 'Duration') {
    const relativeTime = IntlDuration.durationToMs(duration);
    this.setRelativeTime(relativeTime, 'milliseconds', style);
    return this;
  }

  // For 9000 (seconds) (relative unit - so don't need to convert)
  setRelativeTime(
    relativeTime: number,
    convertFrom: keyof typeof dateUnitToMs,
    style: durationStyle = 'Duration',
  ) {
    const duration = IntlDuration.relativeToDuration(relativeTime, convertFrom);
    this.setDuration(duration, style);
    return this;
  }

  // For 1733320467580 (date timestamp) (absolute unit - need to convert to relative)
  setTimestamp(
    timestamp: number,
    style: durationStyle = 'Duration',
    relativeTo: Date | number = new Date(),
  ) {
    const duration = IntlDuration.timestampToDuration(timestamp, relativeTo);
    this.setDuration(duration, style);
    return this;
  }

  protected process(style: durationStyle) {
    switch (style) {
      case 'Progress':
        if (!this.duration) break;
        this.duration = shortTime(this.duration);
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

  static durationToMs(input: durationFormat): number {
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

  static relativeToDuration(input: number, from: keyof typeof dateUnitToMs): durationFormat {
    const relative = Date.now();
    const timestamp = relative + input * dateUnitToMs[from];
    return timestampToRelativeDuration(timestamp, relative).time;
  }

  static timestampToDuration(
    timestamp: number,
    relativeTo: Date | number = new Date(),
  ): durationFormat {
    const relative = new Date(relativeTo).getTime();
    return timestampToRelativeDuration(timestamp, relative).time;
  }

  getRelativeText(format: durationFormatStyle = 'narrow'): string {
    if (!this.duration) return '';
    if (this.isFallback) return timeToString(this.duration);
    // @ts-expect-error surely it works
    return new Intl.DurationFormat(this.locale, { style: format }).format(this.duration);
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

  getDateTimeText(style: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
    if (!isValidDate(this.date)) return '';
    return new Intl.DateTimeFormat(this.locale, style).format(this.date);
  }

  getRelativeNowText(style: durationStyle = 'Duration', format?: durationFormatStyle) {
    if (!this.isValidDate()) return '';
    const relative = new IntlDuration().setLocale(this.locale);
    relative.setTimestamp(this.date.getTime(), style);
    const duration = relative.getDuration();
    if (!duration) return '';
    if (checkForNow(duration)) return api.storage.lang('bookmarksItem_now');
    return relative.getRelativeText(format);
  }

  getRelativeNowFriendlyText(style: durationStyle = 'Duration', format?: durationFormatStyle) {
    const relative = new IntlDuration().setLocale(this.locale);
    relative.setTimestamp(this.date.getTime(), style);
    const duration = relative.getDuration();
    if (!duration) return '';
    return relative.getRelativeText(format);
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

export function timestampToRelativeDuration(
  timestamp: number,
  relativeTo?: Date | number,
): { time: durationFormat; isFuture: boolean } {
  const map: durationFormat = {};
  const relative = relativeTo ? new Date(relativeTo).getTime() : Date.now();
  const isFuture = timestamp > relative;
  let timestampAbs = Math.abs(timestamp - relative);

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

export function checkForNow(
  input: durationFormat | number,
  relativeTo: Date | number = new Date(),
  threshold: durationFormat = { seconds: 30 },
): boolean {
  const relativeToTs = new Date(relativeTo).getTime();
  const durationTs =
    typeof input === 'number' ? input : IntlDuration.durationToMs(input) + relativeToTs;
  const thresholdTs = IntlDuration.durationToMs(threshold);
  const diff = Math.abs(durationTs - relativeToTs);

  if (diff > thresholdTs) return false;
  return true;
}
