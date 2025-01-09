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
