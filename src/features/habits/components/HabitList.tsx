import { HabitItem } from './HabitItem'
import type { Habit } from '@/types/database'

interface HabitListProps {
  habits: Habit[]
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
        아직 등록된 습관이 없어요. 첫 습관을 추가해보세요! 🌱
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
