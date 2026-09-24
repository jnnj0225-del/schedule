import { useState } from 'react'
import type { TodoItem, TodoSection } from './types'
import { newId } from './storage'

interface Props {
  sections: TodoSection[]
  setSections: (sections: TodoSection[]) => void
  onDeleteTexts: (texts: string[]) => void
  struckTexts: Set<string>
  onToggleStrike: (text: string) => void
}

export default function TodoView({ sections, setSections, onDeleteTexts, struckTexts, onToggleStrike }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  function toggleItem(itemId: string) {
    setSections(mapItems(sections, itemId, (item) => ({ ...item, done: !item.done })))
  }

  function updateItem(itemId: string, updates: { text: string; due: string }) {
    setSections(
      mapItems(sections, itemId, (item) => ({
        ...item,
        text: updates.text.trim() || item.text,
        due: updates.due.trim() || undefined,
      })),
    )
    setEditingId(null)
  }

  function updateNote(itemId: string, note: string) {
    setSections(
      mapItems(sections, itemId, (item) => ({
        ...item,
        note: note.trim() || undefined,
      })),
    )
  }

  function moveItem(itemId: string, direction: 'up' | 'down') {
    setSections(
      updateSiblingArray(sections, itemId, (items) => {
        const idx = items.findIndex((i) => i.id === itemId)
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= items.length) return items
        const next = [...items]
        ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
        return next
      }),
    )
  }

  function deleteItem(itemId: string) {
    const deletedTexts: string[] = []
    for (const section of sections) {
      for (const group of section.groups) {
        const found = findItemById(group.items, itemId)
        if (found) collectItemTexts(found, deletedTexts)
      }
    }
    if (deletedTexts.length > 0) onDeleteTexts(deletedTexts)

    setSections(
      sections.map((section) => ({
        ...section,
        groups: section.groups.map((group) => ({
          ...group,
          items: removeItem(group.items, itemId),
        })),
      })),
    )
  }

  function addItem(groupId: string) {
    const text = (drafts[groupId] ?? '').trim()
    if (!text) return
    const newItem: TodoItem = { id: newId(), text, done: false }
    setSections(
      sections.map((section) => ({
        ...section,
        groups: section.groups.map((group) =>
          group.id === groupId ? { ...group, items: [...group.items, newItem] } : group,
        ),
      })),
    )
    setDrafts({ ...drafts, [groupId]: '' })
  }

  return (
    <div className="todo-view">
      {sections.map((section) => (
        <div key={section.id} className="todo-section">
          {section.name && <h2>{section.name}</h2>}
          {section.groups.map((group) => (
            <div key={group.id} className="todo-group">
              <h3>{group.name}</h3>
              <ul>
                {group.items.map((item, idx, arr) => (
                  <TodoRow
                    key={item.id}
                    item={item}
                    editingId={editingId}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onStartEdit={setEditingId}
                    onSaveEdit={updateItem}
                    onSaveNote={updateNote}
                    struckTexts={struckTexts}
                    onToggleStrike={onToggleStrike}
                    onMove={moveItem}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < arr.length - 1}
                  />
                ))}
              </ul>
              <div className="add-row">
                <input
                  value={drafts[group.id] ?? ''}
                  onChange={(e) => setDrafts({ ...drafts, [group.id]: e.target.value })}
                  placeholder="項目を追加"
                  onKeyDown={(e) => e.key === 'Enter' && addItem(group.id)}
                />
                <button onClick={() => addItem(group.id)}>追加</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function TodoRow({
  item,
  editingId,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onSaveNote,
  struckTexts,
  onToggleStrike,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  item: TodoItem
  editingId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onStartEdit: (id: string | null) => void
  onSaveEdit: (id: string, updates: { text: string; due: string }) => void
  onSaveNote: (id: string, note: string) => void
  struckTexts: Set<string>
  onToggleStrike: (text: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const struck = struckTexts.has(item.text)
  const isEditing = editingId === item.id
  const [text, setText] = useState(item.text)
  const [due, setDue] = useState(item.due ?? '')

  function beginEdit() {
    setText(item.text)
    setDue(item.due ?? '')
    onStartEdit(item.id)
  }

  function save() {
    onSaveEdit(item.id, { text, due })
  }

  return (
    <li>
      {isEditing ? (
        <div className="edit-row">
          <input
            className="edit-text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') onStartEdit(null)
            }}
          />
          <input
            className="edit-due"
            type="text"
            value={due}
            placeholder="締め切り (例: 2026-08-20)"
            onChange={(e) => setDue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') onStartEdit(null)
            }}
          />
          <button onClick={save}>保存</button>
          <button onClick={() => onStartEdit(null)}>キャンセル</button>
        </div>
      ) : (
        <label className={item.done ? 'done' : ''}>
          <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
          <span className={struck ? 'struck' : ''} onClick={beginEdit}>
            {item.text}
          </span>
          {item.due ? (
            <span className="due" onClick={beginEdit}>
              {item.due}
            </span>
          ) : (
            <button className="add-due-btn" onClick={beginEdit}>
              + 締め切り
            </button>
          )}
        </label>
      )}
      <button
        className="move-btn"
        disabled={!canMoveUp}
        title="上に移動"
        onClick={() => onMove(item.id, 'up')}
      >
        ▲
      </button>
      <button
        className="move-btn"
        disabled={!canMoveDown}
        title="下に移動"
        onClick={() => onMove(item.id, 'down')}
      >
        ▼
      </button>
      <button className="strike-btn" onClick={() => onToggleStrike(item.text)}>
        {struck ? '取消線を戻す' : '取消線'}
      </button>
      <button className="delete-btn" onClick={() => onDelete(item.id)}>
        削除
      </button>
      <ItemMemo memo={item.note ?? ''} onSave={(note) => onSaveNote(item.id, note)} />
      {item.subitems && item.subitems.length > 0 && (
        <ul className="subitems">
          {item.subitems.map((sub, idx, arr) => (
            <TodoRow
              key={sub.id}
              item={sub}
              editingId={editingId}
              onToggle={onToggle}
              onDelete={onDelete}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onSaveNote={onSaveNote}
              struckTexts={struckTexts}
              onToggleStrike={onToggleStrike}
              onMove={onMove}
              canMoveUp={idx > 0}
              canMoveDown={idx < arr.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ItemMemo({ memo, onSave }: { memo: string; onSave: (memo: string) => void }) {
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

function mapItems(sections: TodoSection[], itemId: string, fn: (item: TodoItem) => TodoItem): TodoSection[] {
  const apply = (items: TodoItem[]): TodoItem[] =>
    items.map((item) => {
      if (item.id === itemId) return fn(item)
      if (item.subitems) return { ...item, subitems: apply(item.subitems) }
      return item
    })
  return sections.map((section) => ({
    ...section,
    groups: section.groups.map((group) => ({ ...group, items: apply(group.items) })),
  }))
}

function updateSiblingArray(
  sections: TodoSection[],
  itemId: string,
  fn: (items: TodoItem[]) => TodoItem[],
): TodoSection[] {
  function tryUpdate(items: TodoItem[]): TodoItem[] | null {
    if (items.some((item) => item.id === itemId)) return fn(items)
    let changed = false
    const next = items.map((item) => {
      if (!item.subitems) return item
      const updatedSub = tryUpdate(item.subitems)
      if (!updatedSub) return item
      changed = true
      return { ...item, subitems: updatedSub }
    })
    return changed ? next : null
  }
  return sections.map((section) => ({
    ...section,
    groups: section.groups.map((group) => {
      const updated = tryUpdate(group.items)
      return updated ? { ...group, items: updated } : group
    }),
  }))
}

function removeItem(items: TodoItem[], itemId: string): TodoItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => (item.subitems ? { ...item, subitems: removeItem(item.subitems, itemId) } : item))
}

function findItemById(items: TodoItem[], itemId: string): TodoItem | null {
  for (const item of items) {
    if (item.id === itemId) return item
    if (item.subitems) {
      const found = findItemById(item.subitems, itemId)
      if (found) return found
    }
  }
  return null
}

function collectItemTexts(item: TodoItem, into: string[]) {
  into.push(item.text)
  if (item.subitems) {
    for (const sub of item.subitems) collectItemTexts(sub, into)
  }
}
