export function msToTime(milliseconds: number) {
  var year, day, hour, minute, seconds;
  seconds = Math.floor(milliseconds / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  day = Math.floor(hour / 24);
  hour = hour % 24;
  year = Math.floor(day / 365);
  day = day % 365;
  return {
    y: year,
    d: day,
    h: hour,
    m: minute,
    s: seconds
  };
}
