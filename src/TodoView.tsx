import { useState } from 'react'
import type { TodoItem, TodoSection } from './types'
import { newId } from './storage'

interface Props {
  sections: TodoSection[]
  setSections: (sections: TodoSection[]) => void
}

export default function TodoView({ sections, setSections }: Props) {
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

  function deleteItem(itemId: string) {
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
                {sortByDue(group.items).map((item) => (
                  <TodoRow
                    key={item.id}
                    item={item}
                    editingId={editingId}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onStartEdit={setEditingId}
                    onSaveEdit={updateItem}
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
}: {
  item: TodoItem
  editingId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onStartEdit: (id: string | null) => void
  onSaveEdit: (id: string, updates: { text: string; due: string }) => void
}) {
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
          <span onClick={beginEdit}>{item.text}</span>
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
      <button className="delete-btn" onClick={() => onDelete(item.id)}>
        削除
      </button>
      {item.note && <p className="note">{item.note}</p>}
      {item.subitems && item.subitems.length > 0 && (
        <ul className="subitems">
          {sortByDue(item.subitems).map((sub) => (
            <TodoRow
              key={sub.id}
              item={sub}
              editingId={editingId}
              onToggle={onToggle}
              onDelete={onDelete}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function sortByDue(items: TodoItem[]): TodoItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.due && b.item.due) {
        if (a.item.due !== b.item.due) return a.item.due < b.item.due ? -1 : 1
        return a.index - b.index
      }
      if (a.item.due) return -1
      if (b.item.due) return 1
      return a.index - b.index
    })
    .map(({ item }) => item)
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

function removeItem(items: TodoItem[], itemId: string): TodoItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => (item.subitems ? { ...item, subitems: removeItem(item.subitems, itemId) } : item))
}
