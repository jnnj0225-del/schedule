import { useState } from 'react'
import CalendarView from './CalendarView'
import TodoView from './TodoView'
import { useLocalStorageState } from './storage'
import { buildInitialDayNotes, buildInitialTodoSections } from './seed'
import type { DayNotes, TodoSection } from './types'

type Tab = 'calendar' | 'todo'

const DAY_NOTES_KEY = 'schedule-app.dayNotes.v2'
const TODO_SECTIONS_KEY = 'schedule-app.todoSections.v2'

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [dayNotes, setDayNotes] = useLocalStorageState<DayNotes>(DAY_NOTES_KEY, buildInitialDayNotes)
  const [todoSections, setTodoSections] = useLocalStorageState<TodoSection[]>(
    TODO_SECTIONS_KEY,
    buildInitialTodoSections,
  )

  function resetToLatest() {
    if (!confirm('この端末でのカレンダー・To doの編集内容を消して、最新の初期データに作り直します。よろしいですか？')) return
    setDayNotes(buildInitialDayNotes())
    setTodoSections(buildInitialTodoSections())
  }

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
          <button className="reset-btn" onClick={resetToLatest} title="この端末の編集内容を消し、最新の初期データに作り直します">
            最新データに更新
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
