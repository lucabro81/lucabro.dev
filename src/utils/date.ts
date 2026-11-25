export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Seconds since the epoch at UTC midnight of a `YYYY-MM-DD` date.
export function toUnixTimestamp(date: string): number {
  return Date.parse(date) / 1000;
}
