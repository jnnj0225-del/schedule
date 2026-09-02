import { useMemo, useState } from 'react'
import { dayNoteKey } from './seed'
import type { DayNotes } from './types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

interface Props {
  dayNotes: DayNotes
  setDayNotes: (notes: DayNotes) => void
  onDeleteNote: (date: string, note: string) => void
  struckKeys: Set<string>
  onToggleStrike: (date: string, note: string) => void
  memos: Record<string, string>
  onSetMemo: (date: string, note: string, memo: string) => void
}

export default function CalendarView({
  dayNotes,
  setDayNotes,
  onDeleteNote,
  struckKeys,
  onToggleStrike,
  memos,
  onSetMemo,
}: Props) {
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(9) // 1-indexed
  const [selected, setSelected] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const result: (number | null)[] = []
    for (let i = 0; i < firstWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  function changeMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    } else if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    setMonth(newMonth)
    setYear(newYear)
    setSelected(null)
  }

  function addNote() {
    if (!selected || !draft.trim()) return
    const existing = dayNotes[selected] ?? []
    setDayNotes({ ...dayNotes, [selected]: [...existing, draft.trim()] })
    setDraft('')
  }

  function removeNote(date: string, index: number) {
    const existing = dayNotes[date] ?? []
    const removed = existing[index]
    const next = existing.filter((_, i) => i !== index)
    const updated = { ...dayNotes }
    if (next.length === 0) {
      delete updated[date]
    } else {
      updated[date] = next
    }
    setDayNotes(updated)
    if (removed !== undefined) onDeleteNote(date, removed)
  }

  return (
    <div>
      <div className="month-nav">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2>
          {year}年{month}月
        </h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday-header">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="day-cell empty" />
          const date = isoDate(year, month, day)
          const notes = dayNotes[date] ?? []
          return (
            <button
              key={i}
              className={`day-cell${selected === date ? ' selected' : ''}`}
              onClick={() => setSelected(date)}
            >
              <span className="day-number">{day}</span>
              <span className="day-notes">
                {notes.slice(0, 3).map((n, idx) => (
                  <span
                    key={idx}
                    className={`day-note-line${struckKeys.has(dayNoteKey(date, n)) ? ' struck' : ''}`}
                  >
                    {n}
                  </span>
                ))}
                {notes.length > 3 && <span className="day-note-more">+{notes.length - 3}</span>}
              </span>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="day-editor">
          <h3>{selected}</h3>
          <ul>
            {(dayNotes[selected] ?? []).map((note, idx) => {
              const key = dayNoteKey(selected, note)
              const struck = struckKeys.has(key)
              return (
                <li key={idx}>
                  <div className="note-main">
                    <span className={struck ? 'struck' : ''}>{note}</span>
                    <span className="note-actions">
                      <button onClick={() => onToggleStrike(selected, note)}>
                        {struck ? '取消線を戻す' : '取消線'}
                      </button>
                      <button onClick={() => removeNote(selected, idx)}>削除</button>
                    </span>
                  </div>
                  <NoteMemo memo={memos[key] ?? ''} onSave={(memo) => onSetMemo(selected, note, memo)} />
                </li>
              )
            })}
            {(dayNotes[selected] ?? []).length === 0 && <li className="muted">予定はありません</li>}
          </ul>
          <div className="add-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="予定を追加"
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button onClick={addNote}>追加</button>
          </div>
        </div>
      )}
    </div>
  )
}

function NoteMemo({ memo, onSave }: { memo: string; onSave: (memo: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(memo)

  function begin() {
    setDraft(memo)
    setEditing(true)
  }

  function save() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="note-memo-edit">
        <input
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          placeholder="メモ"
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
        <button onClick={save}>保存</button>
        <button onClick={() => setEditing(false)}>キャンセル</button>
      </div>
    )
  }

  return memo ? (
    <p className="note-memo" onClick={begin}>
      {memo}
    </p>
  ) : (
    <button className="add-memo-btn" onClick={begin}>
      + メモ
    </button>
  )
}
