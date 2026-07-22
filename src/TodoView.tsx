import { useState } from 'react'
import type { TodoItem, TodoSection } from './types'
import { newId } from './storage'

interface Props {
  sections: TodoSection[]
  setSections: (sections: TodoSection[]) => void
}

export default function TodoView({ sections, setSections }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function toggleItem(itemId: string) {
    setSections(mapItems(sections, itemId, (item) => ({ ...item, done: !item.done })))
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
          <h2>{section.name}</h2>
          {section.groups.map((group) => (
            <div key={group.id} className="todo-group">
              <h3>{group.name}</h3>
              <ul>
                {group.items.map((item) => (
                  <TodoRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
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
  onToggle,
  onDelete,
}: {
  item: TodoItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <li>
      <label className={item.done ? 'done' : ''}>
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span>{item.text}</span>
        {item.due && <span className="due">{item.due}</span>}
      </label>
      <button className="delete-btn" onClick={() => onDelete(item.id)}>
        削除
      </button>
      {item.note && <p className="note">{item.note}</p>}
      {item.subitems && item.subitems.length > 0 && (
        <ul className="subitems">
          {item.subitems.map((sub) => (
            <TodoRow key={sub.id} item={sub} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
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

function removeItem(items: TodoItem[], itemId: string): TodoItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => (item.subitems ? { ...item, subitems: removeItem(item.subitems, itemId) } : item))
}
