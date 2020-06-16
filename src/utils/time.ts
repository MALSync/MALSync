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
