import { describe, expect, it } from 'vitest'

import {
  calculatePregnancyDueDate,
  parseDateOnly,
} from '@/app/(frontend)/resources/_components/pregnancyDueDate'

describe('pregnancy due-date calculator', () => {
  it('calculates 280 days from an LMP for a 28-day cycle', () => {
    const result = calculatePregnancyDueDate('2026-01-01', 28, new Date(2026, 0, 15))

    expect(result?.dueDate.toISOString().slice(0, 10)).toBe('2026-10-08')
    expect(result?.gestationalWeeks).toBe(2)
    expect(result?.remainingGestationalDays).toBe(0)
  })

  it('adjusts the due date for cycle length', () => {
    const result = calculatePregnancyDueDate('2026-01-01', 30, new Date(2026, 0, 15))

    expect(result?.dueDate.toISOString().slice(0, 10)).toBe('2026-10-10')
  })

  it('handles leap-year dates without timezone shifts', () => {
    const result = calculatePregnancyDueDate('2024-02-29', 28, new Date(2024, 2, 1))

    expect(result?.dueDate.toISOString().slice(0, 10)).toBe('2024-12-05')
    expect(parseDateOnly('2024-02-29')?.toISOString()).toBe('2024-02-29T00:00:00.000Z')
  })

  it('rejects malformed, impossible, and future dates', () => {
    const today = new Date(2026, 0, 15)

    expect(calculatePregnancyDueDate('', 28, today)).toBeNull()
    expect(calculatePregnancyDueDate('2026-02-30', 28, today)).toBeNull()
    expect(calculatePregnancyDueDate('2026-01-16', 28, today)).toBeNull()
  })

  it('rejects cycle lengths outside 21 to 35 days and non-integers', () => {
    const today = new Date(2026, 0, 15)

    expect(calculatePregnancyDueDate('2026-01-01', 20, today)).toBeNull()
    expect(calculatePregnancyDueDate('2026-01-01', 36, today)).toBeNull()
    expect(calculatePregnancyDueDate('2026-01-01', 28.5, today)).toBeNull()
  })
})
