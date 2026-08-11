/**
 * UTC calendar-month helpers. Monthly analysis uses ANALYSIS_TIMEZONE = UTC.
 */

export const ANALYSIS_TIMEZONE = "UTC" as const;

export class DomainValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainValidationError";
    this.code = code;
  }
}

export interface UtcYearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export function parseUtcYearMonth(value: string): UtcYearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    throw new DomainValidationError(
      "invalid_year_month",
      "Month must be a UTC calendar month in YYYY-MM format.",
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new DomainValidationError(
      "invalid_year_month",
      "Month must be a UTC calendar month in YYYY-MM format.",
    );
  }
  return { year, month };
}

export function utcYearMonthKey(value: UtcYearMonth): string {
  return `${String(value.year).padStart(4, "0")}-${String(value.month).padStart(2, "0")}`;
}

export function utcYearMonthFromInstant(instant: Date): UtcYearMonth {
  if (Number.isNaN(instant.getTime())) {
    throw new DomainValidationError("invalid_date", "Date must be a valid Instant.");
  }
  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
  };
}

export function isInstantInUtcYearMonth(instant: Date, yearMonth: UtcYearMonth): boolean {
  const actual = utcYearMonthFromInstant(instant);
  return actual.year === yearMonth.year && actual.month === yearMonth.month;
}

/**
 * Whole UTC calendar months remaining for goal pacing, inclusive of the
 * calculation date's month through the target date's month.
 *
 * Requires targetDate > calculationDate. Returns a positive integer; never zero.
 */
export function wholeUtcMonthsRemaining(calculationDate: Date, targetDate: Date): number {
  if (Number.isNaN(calculationDate.getTime()) || Number.isNaN(targetDate.getTime())) {
    throw new DomainValidationError("invalid_date", "Calculation and target dates must be valid.");
  }
  if (!(targetDate.getTime() > calculationDate.getTime())) {
    throw new DomainValidationError(
      "invalid_target_date",
      "Target date must be after the calculation date.",
    );
  }

  const from = utcYearMonthFromInstant(calculationDate);
  const to = utcYearMonthFromInstant(targetDate);
  const months = (to.year - from.year) * 12 + (to.month - from.month) + 1;
  if (months < 1) {
    throw new DomainValidationError(
      "no_months_remaining",
      "No whole monthly periods remain before the target date.",
    );
  }
  return months;
}
