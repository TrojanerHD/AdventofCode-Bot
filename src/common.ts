export function parseDay(date: Date, day?: number): string {
  if (!day) day = date.getDate();
  return date.getDate() < 10 ? `0${day}` : day.toString();
}
