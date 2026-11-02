import { Switch } from '@/components/ui/switch'
import StepperInput from '@/components/StepperInput'

interface BonusRowProps {
  /** undefined = bonus désactivé */
  value:    number | undefined
  onChange: (value: number | null) => void
  name:     string
}

export function BonusRow({ value, onChange, name }: BonusRowProps) {
  const enabled = value !== undefined

  return (
    <div className="flex items-center justify-between gap-3">
      <label className="flex items-center gap-2.5 text-[14px] text-text-2">
        <Switch
          checked={enabled}
          onCheckedChange={checked => onChange(checked ? 0 : null)}
          aria-label={`Bonus pour ${name}`}
        />
        Bonus
      </label>
      {enabled && <StepperInput value={value} onChange={onChange} min={0} step={1} />}
    </div>
  )
}
