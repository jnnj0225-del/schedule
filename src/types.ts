export interface DayNotes {
  [isoDate: string]: string[]
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  due?: string
  note?: string
  subitems?: TodoItem[]
}

export interface TodoGroup {
  id: string
  name: string
  items: TodoItem[]
}

export interface TodoSection {
  id: string
  name: string
  groups: TodoGroup[]
}
