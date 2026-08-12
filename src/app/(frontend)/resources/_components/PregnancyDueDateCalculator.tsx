'use client'

import { CalendarDays, RotateCcw } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'

import {
  calculatePregnancyDueDate,
  DEFAULT_CYCLE_LENGTH,
  formatDateOnly,
  MAX_CYCLE_LENGTH,
  MIN_CYCLE_LENGTH,
} from './pregnancyDueDate'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-950 dark:text-white'

function getTodayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function PregnancyDueDateCalculator() {
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState('')
  const [cycleLength, setCycleLength] = useState(String(DEFAULT_CYCLE_LENGTH))
  const [showResult, setShowResult] = useState(false)

  const result = useMemo(
    () => calculatePregnancyDueDate(lastMenstrualPeriod, Number(cycleLength)),
    [cycleLength, lastMenstrualPeriod],
  )

  const reset = () => {
    setLastMenstrualPeriod('')
    setCycleLength(String(DEFAULT_CYCLE_LENGTH))
    setShowResult(false)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setShowResult(true)
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-fuchsia-700 to-rose-600 p-7 text-white sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <CalendarDays aria-hidden="true" size={26} />
          </div>
          <p className="mt-6 text-sm font-bold tracking-wider text-rose-100 uppercase">
            Pregnancy tool
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Pregnancy due-date calculator
          </h2>
          <p className="mt-4 max-w-md leading-7 text-rose-50">
            Estimate a due date from the first day of your last menstrual period and your usual
            cycle length.
          </p>
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-rose-50">
            This is an estimate, not a diagnosis. Irregular cycles can reduce accuracy, and an
            ultrasound or healthcare professional may revise your due date.
          </div>
        </div>

        <div className="p-7 sm:p-10">
          <form className="space-y-5" onSubmit={submit}>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
              First day of your last menstrual period
              <input
                className={`${inputClass} mt-2`}
                max={getTodayInputValue()}
                onChange={(event) => {
                  setLastMenstrualPeriod(event.target.value)
                  setShowResult(false)
                }}
                required
                type="date"
                value={lastMenstrualPeriod}
              />
            </label>

            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
              Usual menstrual-cycle length
              <span className="relative mt-2 block">
                <input
                  className={`${inputClass} pr-16`}
                  inputMode="numeric"
                  max={MAX_CYCLE_LENGTH}
                  min={MIN_CYCLE_LENGTH}
                  onChange={(event) => {
                    setCycleLength(event.target.value)
                    setShowResult(false)
                  }}
                  required
                  step="1"
                  type="number"
                  value={cycleLength}
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-slate-500">
                  days
                </span>
              </span>
              <span className="mt-2 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
                Enter 21–35 days. The standard estimate assumes a 28-day cycle.
              </span>
            </label>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                type="submit"
              >
                Calculate due date
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={reset}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={16} /> Reset
              </button>
            </div>
          </form>

          <div aria-live="polite" className="mt-6">
            {showResult && result ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Your estimated due date
                </p>
                <strong className="mt-1 block text-3xl font-extrabold text-slate-950 dark:text-white">
                  {formatDateOnly(result.dueDate)}
                </strong>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Based on the date entered, the estimated gestational age today is{' '}
                  <strong>
                    {result.gestationalWeeks} weeks and {result.remainingGestationalDays} days
                  </strong>
                  .
                </p>
                {result.gestationalDays > 294 ? (
                  <p className="mt-3 text-sm font-semibold leading-6 text-rose-800 dark:text-rose-200">
                    This estimate is beyond 42 weeks. Contact a healthcare professional promptly for
                    advice.
                  </p>
                ) : null}
              </div>
            ) : showResult ? (
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                Enter a valid past or current date and a cycle length from 21 to 35 days.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
