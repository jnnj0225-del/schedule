import calendarSeed from '../data/2026-07.json'
import todoSeed from '../data/todo.json'
import type { DayNotes, TodoItem, TodoSection } from './types'
import { newId } from './storage'

export function buildInitialDayNotes(): DayNotes {
  const notes: DayNotes = {}
  for (const day of calendarSeed.days) {
    if (day.notes.length > 0) {
      notes[day.date] = day.notes
    }
  }
  return notes
}

interface SeedItem {
  text: string
  done?: boolean
  due?: string
  date?: string
  note?: string
  subitems?: SeedItem[]
}

function toTodoItem(item: SeedItem): TodoItem {
  return {
    id: newId(),
    text: item.text,
    done: Boolean(item.done),
    due: item.due ?? item.date,
    note: item.note,
    subitems: item.subitems?.map(toTodoItem),
  }
}

export function buildInitialTodoSections(): TodoSection[] {
  return todoSeed.sections.map((section) => ({
    id: newId(),
    name: section.name,
    groups: section.groups.map((group) => ({
      id: newId(),
      name: group.name,
      items: group.items.map(toTodoItem),
    })),
  }))
}
