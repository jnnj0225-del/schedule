import { useState } from 'react'
import CalendarView from './CalendarView'
import TodoView from './TodoView'
import { useLocalStorageState } from './storage'
import { buildInitialDayNotes, buildInitialTodoSections } from './seed'
import type { DayNotes, TodoSection } from './types'

type Tab = 'calendar' | 'todo'

const DAY_NOTES_KEY = 'schedule-app.dayNotes.v5'
const TODO_SECTIONS_KEY = 'schedule-app.todoSections.v4'

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [dayNotes, setDayNotes] = useLocalStorageState<DayNotes>(DAY_NOTES_KEY, buildInitialDayNotes)
  const [todoSections, setTodoSections] = useLocalStorageState<TodoSection[]>(
    TODO_SECTIONS_KEY,
    buildInitialTodoSections,
  )
  const [confirmingReset, setConfirmingReset] = useState(false)

  function resetToLatest() {
    setDayNotes(buildInitialDayNotes())
    setTodoSections(buildInitialTodoSections())
    setConfirmingReset(false)
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
          {confirmingReset ? (
            <>
              <span className="reset-confirm-text">この端末の編集内容を消して最新化します</span>
              <button className="reset-btn danger" onClick={resetToLatest}>
                実行する
              </button>
              <button className="reset-btn" onClick={() => setConfirmingReset(false)}>
                キャンセル
              </button>
            </>
          ) : (
            <button
              className="reset-btn"
              onClick={() => setConfirmingReset(true)}
              title="この端末の編集内容を消し、最新の初期データに作り直します"
            >
              最新データに更新
            </button>
          )}
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
