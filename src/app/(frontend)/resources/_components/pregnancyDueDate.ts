const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export const MIN_CYCLE_LENGTH = 21
export const MAX_CYCLE_LENGTH = 35
export const DEFAULT_CYCLE_LENGTH = 28

export type DueDateResult = {
  dueDate: Date
  gestationalDays: number
  gestationalWeeks: number
  remainingGestationalDays: number
}

export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

export function toUTCDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function formatDateOnly(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

export function calculatePregnancyDueDate(
  lastMenstrualPeriod: string,
  cycleLength: number,
  today = new Date(),
): DueDateResult | null {
  const lmpDate = parseDateOnly(lastMenstrualPeriod)
  if (
    !lmpDate ||
    !Number.isInteger(cycleLength) ||
    cycleLength < MIN_CYCLE_LENGTH ||
    cycleLength > MAX_CYCLE_LENGTH
  ) {
    return null
  }

  const todayUTC = toUTCDateOnly(today)
  if (lmpDate.getTime() > todayUTC.getTime()) return null

  const cycleAdjustment = cycleLength - DEFAULT_CYCLE_LENGTH
  const dueDate = new Date(lmpDate.getTime() + (280 + cycleAdjustment) * DAY_IN_MILLISECONDS)
  const gestationalDays = Math.floor((todayUTC.getTime() - lmpDate.getTime()) / DAY_IN_MILLISECONDS)

  return {
    dueDate,
    gestationalDays,
    gestationalWeeks: Math.floor(gestationalDays / 7),
    remainingGestationalDays: gestationalDays % 7,
  }
}
