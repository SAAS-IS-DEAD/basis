import type { Note } from '@/types/note'

export function copyNote(note: Note): Note {
  return { ...note, todos: note.todos.map((todo) => ({ ...todo })) }
}

export function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') return false
  const note = value as Note
  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    Array.isArray(note.todos) &&
    note.todos.every(
      (todo) =>
        todo &&
        typeof todo.id === 'string' &&
        typeof todo.text === 'string' &&
        typeof todo.done === 'boolean',
    ) &&
    new Set(note.todos.map((todo) => todo.id)).size === note.todos.length
  )
}
