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
  return el;
}
