/* eslint-disable operator-assignment */

export interface timeElement {
  y: number;
  d: number;
  h: number;
  m: number;
  s: number;
}

// TODO - Remove when TS adds support for Intl.DurationFormat
export interface durationFormat {
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
  year: 365 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
} as const;

type durationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

export function timeToString(el: timeElement): string {
  let output = '';

  if (el.y === 1) {
    output += ` ${el.y} ${api.storage.lang('bookmarksItem_Year')}`;
  } else if (el.y > 1) {
    output += ` ${el.y} ${api.storage.lang('bookmarksItem_Years')}`;
  }

  if (el.d === 1) {
    output += ` ${el.d} ${api.storage.lang('bookmarksItem_Day')}`;
  } else if (el.d > 1) {
    output += ` ${el.d} ${api.storage.lang('bookmarksItem_Days')}`;
  }

  if (el.h === 1) {
    output += ` ${el.h} ${api.storage.lang('bookmarksItem_Hour')}`;
  } else if (el.h > 1) {
    output += ` ${el.h} ${api.storage.lang('bookmarksItem_Hours')}`;
  }

  if (el.m === 1) {
    output += ` ${el.m} ${api.storage.lang('bookmarksItem_min')}`;
  } else if (el.m > 1) {
    output += ` ${el.m} ${api.storage.lang('bookmarksItem_mins')}`;
  }

  if (el.s === 1) {
    output += ` ${el.s} ${api.storage.lang('bookmarksItem_sec')}`;
  } else if (el.s > 1) {
    output += ` ${el.s} ${api.storage.lang('bookmarksItem_secs')}`;
  }

  return output.trim();
}

export function shortTime(el: timeElement): timeElement {
  if (el.y > 1) {
    if (el.d > 182) {
      return {
        y: el.y + 1,
        d: 0,
        h: 0,
        m: 0,
        s: 0,
      };
    }
    return {
      y: el.y,
      d: 0,
      h: 0,
      m: 0,
      s: 0,
    };
  }
  if (el.y) {
    return {
      y: el.y,
      d: el.d,
      h: 0,
      m: 0,
      s: 0,
    };
  }
  if (el.d > 3) {
    if (el.h > 11) {
      return {
        y: 0,
        d: el.d + 1,
        h: 0,
        m: 0,
        s: 0,
      };
    }
    return {
      y: 0,
      d: el.d,
      h: 0,
      m: 0,
      s: 0,
    };
  }
  if (el.d) {
    return {
      y: 0,
      d: el.d,
      h: el.h,
      m: 0,
      s: 0,
    };
  }
  if (el.h > 5) {
    if (el.m > 29) {
      return {
        y: 0,
        d: 0,
        h: el.h + 1,
        m: 0,
        s: 0,
      };
    }
    return {
      y: 0,
      d: 0,
      h: el.h,
      m: 0,
      s: 0,
    };
  }
  if (el.h) {
    return {
      y: 0,
      d: 0,
      h: el.h,
      m: el.m,
      s: 0,
    };
  }
  if (el.m > 14) {
    return {
      y: 0,
      d: 0,
      h: 0,
      m: el.m,
      s: 0,
    };
  }
  return {
    y: 0,
    d: 0,
    h: 0,
    m: el.m,
    s: el.s,
  };
}

export function timestampToTime(timestamp: number): { time: durationFormat; isFuture: boolean } {
  const map: durationFormat = {};
  const isFuture = timestamp > Date.now();
  let timestampAbs = Math.abs(timestamp - Date.now());

  for (const key in dateUnitToMs) {
    const value = Math.floor(timestampAbs / dateUnitToMs[key]);
    map[`${key}s`] = value;
  }
  const mapKeys = Object.keys(map);
  for (let i = 1; i < mapKeys.length; i++) {
    const keyPrev = mapKeys[i - 1];
    const valuePrev = map[keyPrev];
    const keyCurr = mapKeys[i];

    timestampAbs = timestampAbs - dateUnitToMs[keyPrev.slice(0, -1)] * valuePrev;
    const valueCurr = Math.floor(timestampAbs / dateUnitToMs[keyCurr.slice(0, -1)]);
    map[keyCurr] = valueCurr;
  }
  return { time: map, isFuture };
}

// TODO: Delete @ts-expect-error comments after TS adds support for Intl.DurationFormat
export function getDurationInLocale(
  duration: durationFormat,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: durationFormatStyle = 'narrow',
): string {
  const minsSecondsOnly =
    (Object.keys(duration).length === 2 && duration.minutes && duration.seconds) ||
    (Object.keys(duration).length === 1 && (duration.minutes || duration.seconds));

  const inputDuration = minsSecondsOnly
    ? minsSecsToHoursMins(duration.minutes, duration.seconds)
    : duration;

  // @ts-expect-error surely it works
  if (!Intl.DurationFormat) {
    return timeToString({
      y: inputDuration.years || 0,
      d: inputDuration.days || 0,
      h: inputDuration.hours || 0,
      m: inputDuration.minutes || 0,
      s: inputDuration.seconds || 0,
    });
  }
  // @ts-expect-error surely it works
  return new Intl.DurationFormat(locale, { style }).format(inputDuration);
}

export function minsSecsToHoursMins(minutes: number = 0, seconds: number = 0): durationFormat {
  try {
    const totalSeconds = minutes * 60 + seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return {
      hours,
      minutes: mins,
    } as durationFormat;
  } catch (_) {
    return {} as durationFormat;
  }
}

export function isValidDate(date: Date | number | null | undefined): boolean {
  if (!date) return false;
  if (typeof date === 'number') return true;
  return date instanceof Date && !Number.isNaN(date.getTime());
}

// TODO: Delete @ts-expect-error comments after TS adds support for Intl.DurationFormat
export function getProgressDateTimeInLocale(
  timestamp: number | null,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: durationFormatStyle = 'narrow',
): string {
  if (!timestamp) return '';
  const result = timestampToTime(timestamp);
  let days = result.time.days || 0;
  if (result.time.weeks) {
    days += result.time.weeks * 7;
  }
  const short = shortTime({
    y: result.time.years || 0,
    d: days,
    h: result.time.hours || 0,
    m: result.time.minutes || 0,
    s: result.time.seconds || 0,
  });
  if (!short.y && !short.d && !short.h && !short.m && short.s <= 30) {
    return api.storage.lang('bookmarksItem_now');
  }
  // @ts-expect-error surely it works
  if (!Intl.DurationFormat) {
    const timeString = timeToString(short);
    return result.isFuture ? timeString : api.storage.lang('bookmarksItem_ago', [timeString]);
  }
  // @ts-expect-error surely it works
  const durationFormat = new Intl.DurationFormat(locale, { style }).format({
    years: short.y,
    days: short.d,
    hours: short.h,
    minutes: short.m,
    seconds: short.s,
  } as durationFormat);
  return result.isFuture ? durationFormat : api.storage.lang('bookmarksItem_ago', [durationFormat]);
}

export function getDateRangeInLocale(
  from: Date | string | number | null | undefined,
  to: Date | string | number | null | undefined,
  locale?: Intl.LocalesArgument,
  style: Intl.DateTimeFormatOptions['dateStyle'] = 'medium',
) {
  const fromElement = typeof from === 'string' ? new Date(from) : from;
  const toElement = typeof to === 'string' ? new Date(to) : to;

  if (!isValidDate(fromElement) || !isValidDate(toElement)) {
    const checkFrom = getDateInLocale(fromElement, locale, style);
    const checkTo = getDateInLocale(toElement, locale, style);
    return `${checkFrom} - ${checkTo}`;
  }
  return getDateTimeRangeInLocale(fromElement!, toElement!, locale, { dateStyle: style });
}

export function getTimeRangeInLocale(
  from: Date | number | null | undefined,
  to: Date | number | null | undefined,
  locale?: Intl.LocalesArgument,
  style: Intl.DateTimeFormatOptions['timeStyle'] = 'short',
) {
  if (!isValidDate(from) || !isValidDate(to)) {
    const checkFrom = getTimeInLocale(from, locale, style);
    const checkTo = getTimeInLocale(to, locale, style);
    return `${checkFrom} - ${checkTo}`;
  }
  return getDateTimeRangeInLocale(from!, to!, locale, { timeStyle: style });
}

export function getDateTimeRangeInLocale(
  from: Date | number,
  to: Date | number,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: Intl.DateTimeFormatOptions | undefined = undefined,
): string {
  if (!Intl.DateTimeFormat) {
    return `${new Date(from).toLocaleString(locale, style)} - ${new Date(to).toLocaleString(locale, style)}`;
  }
  return new Intl.DateTimeFormat(locale, style).formatRange(from, to);
}

export function getDateInLocale(
  date: Date | string | number | null | undefined,
  locale?: Intl.LocalesArgument,
  style: Intl.DateTimeFormatOptions['dateStyle'] = 'medium',
) {
  const dateElement = typeof date === 'string' ? new Date(date) : date;
  if (!isValidDate(dateElement)) return '?';
  return getDateTimeInLocale(dateElement!, locale, { dateStyle: style });
}

export function getTimeInLocale(
  time: Date | number | null | undefined,
  locale?: Intl.LocalesArgument,
  style: Intl.DateTimeFormatOptions['timeStyle'] = 'short',
) {
  if (!isValidDate(time)) return '?';
  return getDateTimeInLocale(time!, locale, { timeStyle: style });
}

export function getDateTimeInLocale(
  date: Date | number,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: Intl.DateTimeFormatOptions | undefined = undefined,
): string {
  if (!Intl.DateTimeFormat) {
    return new Date(date).toLocaleString(locale, style);
  }
  return new Intl.DateTimeFormat(locale, style).format(date);
}

export function dateFromTimezoneToTimezone(
  date: Date,
  sourceTimezone: string,
  targetTimezone: string = 'UTC',
): Date {
  const sourceDate = new Date(new Date().toLocaleString('en-US', { timeZone: sourceTimezone }));
  const targetDate = new Date(new Date().toLocaleString('en-US', { timeZone: targetTimezone }));
  const diff = sourceDate.getTime() - targetDate.getTime();

  return new Date(date.getTime() - diff);
}

export function getWeektime(weekDay: string, time: string): Date | null {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = daysOfWeek.findIndex(
    day =>
      day.toLowerCase() === weekDay.toLowerCase() ||
      weekDay.toLowerCase().startsWith(day.toLowerCase()),
  );

  if (dayIndex === -1) return null;

  // time has format 'hh:mm' or 'hh:mm am/pm'
  const [timeStr, modifier] = time.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);

  let hoursUTC = hours;
  if (modifier?.toLowerCase() === 'pm' && hours !== 12) {
    hoursUTC += 12;
  } else if (modifier?.toLowerCase() === 'am' && hours === 12) {
    hoursUTC = 0;
  }

  return new Date(Date.UTC(2017, 0, dayIndex + 1, hoursUTC, minutes, 0, 0));
}
