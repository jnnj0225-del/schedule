import { useState } from 'react'
import CalendarView from './CalendarView'
import TodoView from './TodoView'
import { useLocalStorageState } from './storage'
import { buildInitialDayNotes, buildInitialTodoSections } from './seed'
import type { DayNotes, TodoSection } from './types'

type Tab = 'calendar' | 'todo'

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [dayNotes, setDayNotes] = useLocalStorageState<DayNotes>('schedule-app.dayNotes', buildInitialDayNotes)
  const [todoSections, setTodoSections] = useLocalStorageState<TodoSection[]>(
    'schedule-app.todoSections',
    buildInitialTodoSections,
  )

  return (
    <div className="app">
      <header>
        <h1>スケジュール管理</h1>
        <nav>
          <button className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}>
            カレンダー
          </button>
          <button className={tab === 'todo' ? 'active' : ''} onClick={() => setTab('todo')}>
            To do
          </button>
        </nav>
      </header>
      <main>
        {tab === 'calendar' ? (
          <CalendarView dayNotes={dayNotes} setDayNotes={setDayNotes} />
        ) : (
          <TodoView sections={todoSections} setSections={setTodoSections} />
        )}
      </main>
    </div>
  )
}
