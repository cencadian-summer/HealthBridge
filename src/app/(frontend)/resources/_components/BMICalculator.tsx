'use client'

import { Calculator, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'

type Units = 'metric' | 'imperial'

function getCategory(bmi: number) {
  if (bmi < 18.5) return ['Below healthy range', 'text-sky-700 dark:text-sky-300']
  if (bmi < 25) return ['Healthy range', 'text-emerald-700 dark:text-emerald-300']
  if (bmi < 30) return ['Above healthy range', 'text-amber-700 dark:text-amber-300']
  return ['Well above healthy range', 'text-rose-700 dark:text-rose-300']
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-950 dark:text-white'

export function BMICalculator() {
  const [units, setUnits] = useState<Units>('metric')
  const [height, setHeight] = useState('')
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const [weight, setWeight] = useState('')
  const [showResult, setShowResult] = useState(false)

  const bmi = useMemo(() => {
    const enteredWeight = Number(weight)
    if (enteredWeight <= 0) return null

    if (units === 'metric') {
      const metres = Number(height) / 100
      return metres > 0 ? enteredWeight / metres ** 2 : null
    }

    const totalInches = Number(feet) * 12 + Number(inches)
    return totalInches > 0 ? (enteredWeight / totalInches ** 2) * 703 : null
  }, [feet, height, inches, units, weight])

  const reset = () => {
    setHeight('')
    setFeet('')
    setInches('')
    setWeight('')
    setShowResult(false)
  }

  const changeUnits = (nextUnits: Units) => {
    setUnits(nextUnits)
    reset()
  }

  const category = bmi ? getCategory(bmi) : null

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="resources-container">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Calculator aria-hidden="true" size={26} />
              </div>
              <p className="mt-6 text-sm font-bold tracking-wider text-cyan-100 uppercase">
                Health tool
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">BMI calculator</h2>
              <p className="mt-4 max-w-md leading-7 text-cyan-50">
                Estimate your body mass index using your height and weight. BMI is a general
                screening tool and does not diagnose health conditions.
              </p>
              <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-cyan-50">
                For children, teens, pregnancy, or personalized health advice, speak with a
                healthcare professional.
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <div
                className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
                aria-label="Unit system"
              >
                {(['metric', 'imperial'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => changeUnits(unit)}
                    aria-pressed={units === unit}
                    className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition-colors ${
                      units === unit
                        ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>

              <form
                className="mt-7 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  setShowResult(true)
                }}
              >
                {units === 'metric' ? (
                  <NumberField
                    label="Height"
                    value={height}
                    onChange={setHeight}
                    min={80}
                    max={250}
                    placeholder="170"
                    suffix="cm"
                  />
                ) : (
                  <fieldset>
                    <legend className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Height
                    </legend>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <NumberField
                        label="Feet"
                        value={feet}
                        onChange={setFeet}
                        min={2}
                        max={8}
                        placeholder="5"
                        suffix="ft"
                        hideLabel
                      />
                      <NumberField
                        label="Inches"
                        value={inches}
                        onChange={setInches}
                        min={0}
                        max={11.9}
                        placeholder="7"
                        suffix="in"
                        hideLabel
                      />
                    </div>
                  </fieldset>
                )}

                <NumberField
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  min={units === 'metric' ? 25 : 55}
                  max={units === 'metric' ? 350 : 770}
                  placeholder={units === 'metric' ? '70' : '154'}
                  suffix={units === 'metric' ? 'kg' : 'lb'}
                />

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    Calculate BMI
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RotateCcw aria-hidden="true" size={16} /> Reset
                  </button>
                </div>
              </form>

              <div aria-live="polite" className="mt-6">
                {showResult && bmi && category ? (
                  <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900 dark:bg-teal-950/40">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Your estimated BMI
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <strong className="text-4xl font-extrabold text-slate-950 dark:text-white">
                        {bmi.toFixed(1)}
                      </strong>
                      <span className={`font-bold ${category[1]}`}>{category[0]}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      A BMI from 18.5 to 24.9 is generally considered within the healthy range for
                      most adults.
                    </p>
                  </div>
                ) : showResult ? (
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Enter a valid height and weight to calculate your BMI.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type NumberFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  min: number
  max: number
  placeholder: string
  suffix: string
  hideLabel?: boolean
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
  suffix,
  hideLabel,
}: NumberFieldProps) {
  return (
    <label
      className={`block text-sm font-bold text-slate-800 dark:text-slate-100 ${hideLabel ? 'relative' : ''}`}
    >
      <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
      <span className={`relative block ${hideLabel ? '' : 'mt-2'}`}>
        <input
          required
          min={min}
          max={max}
          step="0.1"
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-slate-500">
          {suffix}
        </span>
      </span>
    </label>
  )
}
