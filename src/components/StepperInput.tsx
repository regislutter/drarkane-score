import { useState } from 'react'
import { cva } from 'class-variance-authority'

const stepperBtn = cva(
  'p-0 flex items-center justify-center bg-primary border-0 text-white font-medium leading-none transition duration-150 flex-shrink-0 cursor-pointer hover:bg-primary-dark active:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        md: 'w-[42px] text-[22px]',
        sm: 'w-[34px] text-[18px]',
      },
      side: {
        left:  'rounded-l-[6px]',
        right: 'rounded-r-[6px]',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

const stepperInput = cva(
  'text-center font-bold text-text border-t-0 border-b-0 rounded-none bg-transparent outline-none cursor-text',
  {
    variants: {
      size: {
        md: 'w-24 text-[18px] py-2 px-1',
        sm: 'w-9 text-[15px] py-1.5 px-0.5',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

interface StepperInputProps {
  value:     number
  onChange:  (newValue: number) => void
  min?:      number
  max?:      number
  step?:     number
  disabled?: boolean
  size?:     'sm' | 'md'
}

export default function StepperInput({
  value,
  onChange,
  min      = 0,
  max,
  step     = 2,
  disabled = false,
  size     = 'md',
}: StepperInputProps) {
  const [raw,     setRaw]     = useState<string>('')
  const [focused, setFocused] = useState<boolean>(false)

  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(max !== undefined ? Math.min(max, value + step) : value + step)

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setRaw(String(value))
    setFocused(true)
    e.target.select()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const r = e.target.value
    setRaw(r)
    const num = parseInt(r, 10)
    if (!isNaN(num)) {
      let clamped = Math.max(min, num)
      if (max !== undefined) clamped = Math.min(max, clamped)
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    setFocused(false)
    const num = parseInt(raw, 10)
    if (isNaN(num)) onChange(value)
  }

  const displayValue = focused ? raw : String(value)

  return (
    <div className="inline-flex items-stretch rounded-[8px] border-[1.5px] border-border-2 overflow-hidden bg-surface-2">
      <button
        type="button"
        className={stepperBtn({ size, side: 'left' })}
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Diminuer"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label="Valeur"
        className={stepperInput({ size })}
      />
      <button
        type="button"
        className={stepperBtn({ size, side: 'right' })}
        onClick={inc}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label="Augmenter"
      >
        +
      </button>
    </div>
  )
}
