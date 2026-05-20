const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: string | null): string {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "Unknown";
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) {
    return "Dates unknown";
  }

  if (startDate && endDate && startDate !== endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  return formatDate(startDate ?? endDate);
}

export function compareDates(a: string | null, b: string | null): number {
  const left = parseDate(a)?.getTime() ?? Number.POSITIVE_INFINITY;
  const right = parseDate(b)?.getTime() ?? Number.POSITIVE_INFINITY;
  return left - right;
}

export function isBetween(value: string | null, startDate: string, endDate: string): boolean {
  const date = parseDate(value);
  if (!date) {
    return false;
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    return true;
  }

  return date >= start && date <= end;
}
