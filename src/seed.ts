import augustSeed from '../data/2026-08.json'
import todoSeed from '../data/todo-2026-08.json'
import type { DayNotes, TodoItem, TodoSection } from './types'
import { newId } from './storage'

const calendarSeeds = [augustSeed]

export function buildInitialDayNotes(): DayNotes {
  const notes: DayNotes = {}
  for (const month of calendarSeeds) {
    for (const day of month.days) {
      if (day.notes.length > 0) {
        notes[day.date] = day.notes
      }
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

function collectTexts(items: TodoItem[], into: Set<string>) {
  for (const item of items) {
    into.add(item.text)
    if (item.subitems) collectTexts(item.subitems, into)
  }
}

/**
 * Adds any seed items/notes not already present, without touching existing
 * entries (done state, edited text/due, user-added items are all preserved).
 * Matching is by exact text, since seed items get fresh ids on every load.
 */
export function mergeTodoSections(current: TodoSection[], seed: TodoSection[]): TodoSection[] {
  const existingTexts = new Set<string>()
  for (const section of current) {
    for (const group of section.groups) {
      collectTexts(group.items, existingTexts)
    }
  }

  const result = current.map((section) => ({
    ...section,
    groups: section.groups.map((group) => ({ ...group, items: [...group.items] })),
  }))

  for (const seedSection of seed) {
    const targetSection = result.find((s) => s.name === seedSection.name)
    if (!targetSection) {
      result.push({ id: newId(), name: seedSection.name, groups: seedSection.groups })
      continue
    }
    for (const seedGroup of seedSection.groups) {
      const newItems = seedGroup.items.filter((item) => !existingTexts.has(item.text))
      const targetGroup = targetSection.groups.find((g) => g.name === seedGroup.name)
      if (!targetGroup) {
        if (seedGroup.items.length > 0) {
          targetSection.groups.push({ id: newId(), name: seedGroup.name, items: seedGroup.items })
        }
        continue
      }
      if (newItems.length > 0) {
        targetGroup.items.push(...newItems)
      }
    }
  }
  return result
}

/** Adds any seed day-notes not already present for that date; existing notes are untouched. */
export function mergeDayNotes(current: DayNotes, seed: DayNotes): DayNotes {
  const merged: DayNotes = { ...current }
  for (const [date, notes] of Object.entries(seed)) {
    const existing = merged[date]
    if (!existing) {
      if (notes.length > 0) merged[date] = [...notes]
      continue
    }
    const existingSet = new Set(existing)
    const newNotes = notes.filter((n) => !existingSet.has(n))
    if (newNotes.length > 0) {
      merged[date] = [...existing, ...newNotes]
    }
  }
  return merged
}
