import { useState } from 'react'
import CalendarView from './CalendarView'
import TodoView from './TodoView'
import { useLocalStorageState } from './storage'
import { buildInitialDayNotes, buildInitialTodoSections, dayNoteKey, mergeDayNotes, mergeTodoSections } from './seed'
import type { DayNotes, TodoSection } from './types'

type Tab = 'calendar' | 'todo'

const DAY_NOTES_KEY = 'schedule-app.dayNotes.v5'
const TODO_SECTIONS_KEY = 'schedule-app.todoSections.v5'
const DELETED_TODO_TEXTS_KEY = 'schedule-app.deletedTodoTexts.v1'
const DELETED_DAY_NOTE_KEYS_KEY = 'schedule-app.deletedDayNoteKeys.v1'
const STRUCK_DAY_NOTE_KEYS_KEY = 'schedule-app.struckDayNoteKeys.v1'
const DAY_NOTE_MEMOS_KEY = 'schedule-app.dayNoteMemos.v1'
const STRUCK_TODO_TEXTS_KEY = 'schedule-app.struckTodoTexts.v1'

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [dayNotes, setDayNotes] = useLocalStorageState<DayNotes>(DAY_NOTES_KEY, buildInitialDayNotes)
  const [todoSections, setTodoSections] = useLocalStorageState<TodoSection[]>(
    TODO_SECTIONS_KEY,
    buildInitialTodoSections,
  )
  const [deletedTodoTexts, setDeletedTodoTexts] = useLocalStorageState<string[]>(DELETED_TODO_TEXTS_KEY, () => [])
  const [deletedDayNoteKeys, setDeletedDayNoteKeys] = useLocalStorageState<string[]>(
    DELETED_DAY_NOTE_KEYS_KEY,
    () => [],
  )
  const [struckDayNoteKeys, setStruckDayNoteKeys] = useLocalStorageState<string[]>(
    STRUCK_DAY_NOTE_KEYS_KEY,
    () => [],
  )
  const [dayNoteMemos, setDayNoteMemos] = useLocalStorageState<Record<string, string>>(
    DAY_NOTE_MEMOS_KEY,
    () => ({}),
  )
  const [struckTodoTexts, setStruckTodoTexts] = useLocalStorageState<string[]>(STRUCK_TODO_TEXTS_KEY, () => [])
  const [justUpdated, setJustUpdated] = useState(false)

  function handleDeleteTodoTexts(texts: string[]) {
    setDeletedTodoTexts((prev) => Array.from(new Set([...prev, ...texts])))
    setStruckTodoTexts((prev) => prev.filter((t) => !texts.includes(t)))
  }

  function handleToggleStrikeTodo(text: string) {
    setStruckTodoTexts((prev) => (prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text]))
  }

  function handleDeleteDayNote(date: string, note: string) {
    const key = dayNoteKey(date, note)
    setDeletedDayNoteKeys((prev) => Array.from(new Set([...prev, key])))
    setDayNoteMemos((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleToggleStrikeDayNote(date: string, note: string) {
    const key = dayNoteKey(date, note)
    setStruckDayNoteKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function handleSetDayNoteMemo(date: string, note: string, memo: string) {
    const key = dayNoteKey(date, note)
    setDayNoteMemos((prev) => {
      const next = { ...prev }
      if (memo.trim()) {
        next[key] = memo.trim()
      } else {
        delete next[key]
      }
      return next
    })
  }

  function updateToLatest() {
    setDayNotes(mergeDayNotes(dayNotes, buildInitialDayNotes(), new Set(deletedDayNoteKeys)))
    setTodoSections(mergeTodoSections(todoSections, buildInitialTodoSections(), new Set(deletedTodoTexts)))
    setJustUpdated(true)
    setTimeout(() => setJustUpdated(false), 2000)
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
          <button
            className="reset-btn"
            onClick={updateToLatest}
            title="配布データにある新しい項目・予定だけを取り込みます。この端末で追加・編集した内容は消えません"
          >
            {justUpdated ? '取り込みました' : '最新データに更新'}
          </button>
        </nav>
      </header>
      <main>
        {tab === 'calendar' ? (
          <CalendarView
            dayNotes={dayNotes}
            setDayNotes={setDayNotes}
            onDeleteNote={handleDeleteDayNote}
            struckKeys={new Set(struckDayNoteKeys)}
            onToggleStrike={handleToggleStrikeDayNote}
            memos={dayNoteMemos}
            onSetMemo={handleSetDayNoteMemo}
          />
        ) : (
          <TodoView
            sections={todoSections}
            setSections={setTodoSections}
            onDeleteTexts={handleDeleteTodoTexts}
            struckTexts={new Set(struckTodoTexts)}
            onToggleStrike={handleToggleStrikeTodo}
          />
        )}
      </main>
    </div>
  )
}
