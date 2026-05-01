'use client'

// Design Ref: §5.4 — weekly 선택 시 요일 피커 표시
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface FrequencyDaysPickerProps {
  selectedDays: number[]
  onChange: (days: number[]) => void
}

export function FrequencyDaysPicker({ selectedDays, onChange }: FrequencyDaysPickerProps) {
  const toggle = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day))
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex justify-between items-center py-2">
      {DAY_LABELS.map((label, index) => (
        <button
          key={index}
          type="button"
          onClick={() => toggle(index)}
          className={`h-10 w-10 rounded-xl text-sm font-black transition-all ${
            selectedDays.includes(index)
              ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
