'use client'

import { Calculator, CalendarDays } from 'lucide-react'
import { KeyboardEvent, useState } from 'react'

import { BMICalculator } from './BMICalculator'
import { PregnancyDueDateCalculator } from './PregnancyDueDateCalculator'

type CalculatorTool = 'bmi' | 'pregnancy'

const tools = [
  { id: 'bmi', label: 'BMI calculator', icon: Calculator },
  { id: 'pregnancy', label: 'Pregnancy due date', icon: CalendarDays },
] as const

export function HealthCalculators() {
  const [activeTool, setActiveTool] = useState<CalculatorTool>('bmi')

  const moveTabFocus = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tools.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tools.length) % tools.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tools.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const nextTool = tools[nextIndex]
    setActiveTool(nextTool.id)
    document.getElementById(`${nextTool.id}-calculator-tab`)?.focus()
  }

  return (
    <section
      aria-labelledby="health-calculators-heading"
      className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div className="resources-container">
        <div className="mx-auto mb-7 max-w-5xl">
          <p className="text-sm font-bold tracking-wider text-teal-700 uppercase dark:text-teal-300">
            Interactive health tools
          </p>
          <h2
            className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white"
            id="health-calculators-heading"
          >
            Choose a calculator
          </h2>
          <div
            aria-label="Health calculators"
            className="mt-5 inline-flex max-w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            role="tablist"
          >
            {tools.map(({ id, label, icon: Icon }, index) => {
              const selected = activeTool === id

              return (
                <button
                  aria-controls={`${id}-calculator-panel`}
                  aria-selected={selected}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                  id={`${id}-calculator-tab`}
                  key={id}
                  onClick={() => setActiveTool(id)}
                  onKeyDown={(event) => moveTabFocus(event, index)}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                >
                  <Icon aria-hidden="true" size={18} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          aria-labelledby="bmi-calculator-tab"
          hidden={activeTool !== 'bmi'}
          id="bmi-calculator-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <BMICalculator />
        </div>
        <div
          aria-labelledby="pregnancy-calculator-tab"
          hidden={activeTool !== 'pregnancy'}
          id="pregnancy-calculator-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <PregnancyDueDateCalculator />
        </div>
      </div>
    </section>
  )
}
