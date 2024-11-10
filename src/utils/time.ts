/* eslint-disable operator-assignment */

export interface timeElement {
  y: number;
  d: number;
  h: number;
  m: number;
  s: number;
}

export interface durationFormat {
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
  year: 365 * 24 * 60 * 60 * 1000,
  quarter: 3 * 30 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
} as const;

type durationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

export function dateTimeToText(el: timeElement): string {
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
    return dateTimeToText({
      y: 0,
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

export function relativeTimeToTimestamp(value: number, unit: Intl.RelativeTimeFormatUnit): number {
  const ms = dateUnitToMs[unit];
  if (!ms) return NaN;
  const relativeMs = ms * value;
  const timestamp = Date.now() + relativeMs;
  return timestamp;
}

export function timestampToRelativeTime(
  timestamp: number,
  floor: boolean = true,
): [number, Intl.RelativeTimeFormatUnit][] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map: any[] = [];
  const diff = timestamp > Date.now();
  let timestampAbs = Math.abs(timestamp - Date.now());

  for (const key in dateUnitToMs) {
    if (timestampAbs < dateUnitToMs[key]) continue;
    map.push([Math.floor(timestampAbs / dateUnitToMs[key]), key as Intl.RelativeTimeFormatUnit]);
  }
  map.sort((a, b) => a[1] - b[1]);
  if (floor) return [[map[0][0] * (diff ? 1 : -1), map[0][1]]];

  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue;
    const [valuePrev, keyPrev] = map[i - 1];
    const [, keyCurr] = map[i];
    timestampAbs = timestampAbs - dateUnitToMs[keyPrev] * valuePrev;
    const valueCurr = Math.floor(timestampAbs / dateUnitToMs[keyCurr]);
    map[i] = [keyCurr, valueCurr];
  }
  for (let i = 0; i < map.length; i++) map[i][0] *= diff ? 1 : -1;
  return map.filter(el => el[0] !== 0) as [[number, Intl.RelativeTimeFormatUnit]];
}

export function relativeToText(value: number, unit: Intl.RelativeTimeFormatUnit): string {
  const absValue = Math.abs(value);
  let output = `${absValue}`;

  switch (unit) {
    case 'years':
    case 'year':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Years')
          : api.storage.lang('bookmarksItem_Year');
      break;
    case 'quarters':
    case 'quarter':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Quarters')
          : api.storage.lang('bookmarksItem_Quarter');
      break;
    case 'months':
    case 'month':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Months')
          : api.storage.lang('bookmarksItem_Month');
      break;
    case 'weeks':
    case 'week':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Weeks')
          : api.storage.lang('bookmarksItem_Week');
      break;
    case 'days':
    case 'day':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Days')
          : api.storage.lang('bookmarksItem_Day');
      break;
    case 'hours':
    case 'hour':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_Hours')
          : api.storage.lang('bookmarksItem_Hour');
      break;
    case 'minutes':
    case 'minute':
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_mins')
          : api.storage.lang('bookmarksItem_min');
      break;
    case 'seconds':
    case 'second':
      if (absValue <= 30) return api.storage.lang('bookmarksItem_now');
      output +=
        absValue > 1
          ? api.storage.lang('bookmarksItem_secs')
          : api.storage.lang('bookmarksItem_sec');
      break;
    default:
      break;
  }
  if (value < 0) return api.storage.lang('bookmarksItem_ago', [`${output}`]);

  return output.trim();
}

export function getRelativeFromTimestampInLocale(
  timestamp: number,
  locale?: Intl.LocalesArgument,
  style?: Intl.RelativeTimeFormatOptions,
): string {
  return getRelativeDateTimeInLocale(undefined, undefined, timestamp, locale, style);
}

export function getRelativeFromUnitInLocale(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale?: Intl.LocalesArgument,
  style?: Intl.RelativeTimeFormatOptions,
): string {
  return getRelativeDateTimeInLocale(value, unit, undefined, locale, style);
}

function getRelativeDateTimeInLocale(
  value?: number,
  unit?: Intl.RelativeTimeFormatUnit,
  timestamp?: number,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: Intl.RelativeTimeFormatOptions = {
    numeric: 'auto',
    style: 'short',
  },
): string {
  if (timestamp) {
    const [relValue, relUnit] = timestampToRelativeTime(timestamp)[0];
    if (!Intl.RelativeTimeFormat) {
      return relativeToText(relValue, relUnit);
    }
    return new Intl.RelativeTimeFormat(locale, style).format(relValue, relUnit);
  }
  if (value && unit) {
    if (!Intl.RelativeTimeFormat) {
      return relativeToText(value, unit);
    }
    return new Intl.RelativeTimeFormat(locale, style).format(value, unit);
  }
  return '';
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
  const fromElement = typeof from === 'string' ? new Date(from) : from;
  const toElement = typeof to === 'string' ? new Date(to) : to;

  if (!isValidDate(fromElement) || !isValidDate(toElement)) {
    const checkFrom = getTimeInLocale(fromElement, locale, style);
    const checkTo = getTimeInLocale(toElement, locale, style);
    return `${checkFrom} - ${checkTo}`;
  }
  return getDateTimeRangeInLocale(fromElement!, toElement!, locale, { timeStyle: style });
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
  const timeElement = typeof time === 'string' ? new Date(time) : time;
  if (!isValidDate(timeElement)) return '?';
  return getDateTimeInLocale(timeElement!, locale, { timeStyle: style });
}

export function getDateTimeInLocale(
  date: Date | number,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: Intl.DateTimeFormatOptions | undefined = undefined,
): string {
  if (!Intl.DateTimeFormat) {
    return date.toLocaleString(locale, style);
  }
  return new Intl.DateTimeFormat(locale, style).format(date);
}

export function getDateTimeRangeInLocale(
  from: Date | number,
  to: Date | number,
  locale: Intl.LocalesArgument = api.storage.lang('locale'),
  style: Intl.DateTimeFormatOptions | undefined = undefined,
): string {
  if (!Intl.DateTimeFormat) {
    return `${from.toLocaleString(locale, style)} - ${to.toLocaleString(locale, style)}`;
  }
  return new Intl.DateTimeFormat(locale, style).formatRange(from, to);
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
