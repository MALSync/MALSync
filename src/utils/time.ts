/* eslint-disable operator-assignment */

export interface timeElement {
  y: number;
  d: number;
  h: number;
  m: number;
  s: number;
}

export function msToTime(milliseconds: number): timeElement {
  let day;
  let hour;
  let minute;
  let seconds;
  seconds = Math.floor(milliseconds / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  day = Math.floor(hour / 24);
  hour = hour % 24;
  const year = Math.floor(day / 365);
  day = day % 365;
  return {
    y: year,
    d: day,
    h: hour,
    m: minute,
    s: seconds,
  };
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

export function msDiffToShortTimeString(ms: number): string {
  return timeToString(shortTime(msToTime(ms)));
}

export function timestampToShortTime(tm: number, ago = true): string {
  if (!tm) return '';
  const curTime = Date.now();
  let diff;
  let future;
  if (curTime > tm) {
    future = false;
    diff = curTime - tm;
  } else {
    future = true;
    diff = tm - curTime;
  }

  if (diff < 30 * 1000) return api.storage.lang('bookmarksItem_now');

  let short = msDiffToShortTimeString(diff);

  if (!future && ago) short = api.storage.lang('bookmarksItem_ago', [short]);

  return short;
}

export function timestampToShortDate(ts: number): string {
  const date = new Date(ts);

  const monthAbbreviation = date.toLocaleString('default', { month: 'short' });
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  return `${monthAbbreviation} ${dayOfMonth}, ${year}`;
}
