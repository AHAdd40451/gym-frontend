// Format a date as YYYY-MM-DD in local time (avoid timezone drift)
export function formatDateKey(date: Date): string {
  const tzAdjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().split("T")[0];
}

