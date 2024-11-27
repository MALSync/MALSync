/* eslint-disable no-case-declarations */
// TODO: Delete @ts-expect-error comments after TS will add support for Intl.DurationFormat

type durationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

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

enum Rules {
  DurationFormat,
  Progress,
  Range,
  DateTime,
}

export class IntlWrapper {
  // Output variables
  protected output: {
    text: string;
    progress: {
      time?: durationFormat;
      isFuture: boolean;
    };
  } = {
    text: '',
    progress: {
      isFuture: false,
    },
  };

  // Input variables
  protected from: Date | number = new Date();

  protected to: Date | number = new Date();

  protected locale: Intl.LocalesArgument = api.storage.lang('locale');

  protected duration?: durationFormat;

  protected timestamp?: number;

  // @ts-expect-error surely it works
  protected isFallback = !Intl.DurationFormat;

  constructor() {
    return this;
  }

  // Setters
  setTimestamp(timestamp: number, convertFrom?: keyof typeof dateUnitToMs) {
    this.setDate(
      convertFrom ? Number(IntlWrapper.toTimestamp(timestamp, convertFrom)) : Number(timestamp),
    );
    return this;
  }

  setDates(from: Date | number | string, to: Date | number | string) {
    this.from = new Date(from);
    this.to = new Date(to);
    this.timestamp = this.from.getTime();
    return this;
  }

  setDate(date: Date | number | string) {
    this.setDates(date, date);
    return this;
  }

  setDuration(duration: durationFormat) {
    this.duration = duration;
    return this;
  }

  setLocale(locale: Intl.LocalesArgument) {
    this.locale = locale;
    return this;
  }

  // Processing functions
  protected transform(rule: Rules) {
    switch (rule) {
      case Rules.DurationFormat:
        if (this.timestamp) this.output.progress = timestampToTime(this.timestamp);
        if (this.duration) this.output.progress.time = this.duration;
        break;
      case Rules.Progress:
        if (this.timestamp) this.output.progress = timestampToTime(this.timestamp);
        if (this.duration) this.output.progress.time = this.duration;
        break;
      case Rules.Range:
        break;
      case Rules.DateTime:
        break;
      default:
        break;
    }

    return this;
  }

  protected format(
    rule: Rules,
    args?: { dateTimeStyle?: Intl.DateTimeFormatOptions; durationStyle?: durationFormatStyle },
  ) {
    switch (rule) {
      case Rules.DurationFormat:
        this.output.text = this.getDurationFormat(args ? args.durationStyle : undefined);
        break;
      case Rules.Progress:
        if (!this.output.progress.time) {
          this.output.text = '';
          break;
        }
        this.output.progress.time = shortTime(this.output.progress.time);
        if (this.checkForNow()) {
          this.output.text = api.storage.lang('bookmarksItem_now');
          break;
        }
        this.output.text = this.getDurationFormat(args ? args.durationStyle : undefined);
        break;
      case Rules.Range:
        const validFrom = isValidDate(this.from);
        const validTo = isValidDate(this.to);
        if (!validFrom || !validTo) {
          const from = validFrom
            ? this.getDateTimeText(this.from, args ? args.dateTimeStyle : undefined)
            : '?';
          const to = validTo
            ? this.getDateTimeText(this.to, args ? args.dateTimeStyle : undefined)
            : '?';
          this.output.text = `${from} - ${to}`;
          break;
        }
        this.output.text = this.getDateTimeRangeText(
          this.from,
          this.to,
          args ? args.dateTimeStyle : undefined,
        );
        break;
      case Rules.DateTime:
        this.output.text = this.getDateTimeText(this.from, args ? args.dateTimeStyle : undefined);
        break;
      default:
        break;
    }

    return this;
  }

  // Intl wrapper functions
  protected getDateTimeFormat(style: Intl.DateTimeFormatOptions | undefined = undefined) {
    return new Intl.DateTimeFormat(this.locale, style);
  }

  protected getDateTimeText(
    date: Date | number,
    style: Intl.DateTimeFormatOptions | undefined = undefined,
  ) {
    return this.getDateTimeFormat(style).format(date);
  }

  protected getDateTimeRangeText(
    from: Date | number,
    to: Date | number,
    style: Intl.DateTimeFormatOptions | undefined = undefined,
  ) {
    return this.getDateTimeFormat(style).formatRange(from, to);
  }

  protected getDurationFormat(style: durationFormatStyle | undefined = undefined) {
    if (!this.output.progress.time) return '';
    if (this.isFallback) {
      return timeToString(this.output.progress.time);
    }
    // @ts-expect-error surely it works
    return new Intl.DurationFormat(this.locale, { style }).format(this.output.progress.time);
  }

  // Utility
  static toTimestamp(time: number, from: keyof typeof dateUnitToMs): number {
    return Date.now() + time * dateUnitToMs[from];
  }

  protected checkForNow(): boolean {
    if (!this.output.progress.time) return false;
    const keys = Object.keys(this.output.progress.time);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = this.output.progress.time[key];
      if (value !== 0 && key !== 'seconds') return false;
      if (value <= 30 && key === 'seconds') break;
    }
    return true;
  }

  toTimestamp(from: keyof typeof dateUnitToMs) {
    if (!this.timestamp) return this;
    this.timestamp = Date.now() + this.timestamp * dateUnitToMs[from];
    this.setDate(this.timestamp);
    return this;
  }

  // Getters
  Duration = {
    get: (style: durationFormatStyle = 'narrow'): string => {
      this.transform(Rules.DurationFormat).format(Rules.DurationFormat, {
        durationStyle: style,
      });
      return this.output.text;
    },
  };

  Progress = {
    get: (style: durationFormatStyle = 'narrow') => {
      this.transform(Rules.Progress).format(Rules.Progress, { durationStyle: style });
      return { time: this.output.text, isFuture: this.output.progress.isFuture };
    },
  };

  DateTime = {
    get: (style?: Intl.DateTimeFormatOptions) => {
      this.transform(Rules.DateTime).format(Rules.DateTime, {
        dateTimeStyle: style,
      });
      return this.output.text;
    },
    Time: {
      get: (style: Intl.DateTimeFormatOptions['timeStyle'] = 'short') => {
        this.transform(Rules.DateTime).format(Rules.DateTime, {
          dateTimeStyle: { timeStyle: style },
        });
        return this.output.text;
      },
    },
    Date: {
      get: (style: Intl.DateTimeFormatOptions['dateStyle'] = 'medium') => {
        this.transform(Rules.DateTime).format(Rules.DateTime, {
          dateTimeStyle: { dateStyle: style },
        });
        return this.output.text;
      },
    },
  };

  Range = {
    get: (style?: Intl.DateTimeFormatOptions) => {
      this.transform(Rules.Range).format(Rules.Range, { dateTimeStyle: style });
      return this.output.text;
    },
    Time: {
      get: (style: Intl.DateTimeFormatOptions['timeStyle'] = 'short') => {
        this.transform(Rules.Range).format(Rules.Range, { dateTimeStyle: { timeStyle: style } });
        return this.output.text;
      },
    },
    Date: {
      get: (style: Intl.DateTimeFormatOptions['dateStyle'] = 'medium') => {
        this.transform(Rules.Range).format(Rules.Range, { dateTimeStyle: { dateStyle: style } });
        return this.output.text;
      },
    },
  };
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
