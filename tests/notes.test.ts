import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NOTES_KEY } from '@/constants/notes'
import { copyNote } from '@/domain/note'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/types/note'

const note: Note = {
  id: 'one',
  title: 'Покупки',
  todos: [{ id: 'a', text: 'Молоко', done: false }],
}
let data: Map<string, string>
let storage: {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  data = new Map()
  storage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => data.set(key, value)),
  }
  vi.stubGlobal('localStorage', storage)
  setActivePinia(createPinia())
})
afterEach(() => vi.unstubAllGlobals())

describe('заметки', () => {
  it('сохраняет версию схемы и загружает данные заново', () => {
    const store = useNotesStore()
    expect(store.save(note, true)).toBe(true)
    expect(JSON.parse(data.get(NOTES_KEY) ?? '')).toEqual({
      version: 1,
      notes: [note],
    })
    setActivePinia(createPinia())
    const reloaded = useNotesStore()
    reloaded.load()
    expect(reloaded.notes).toEqual([note])
  })

  it('редактирование копии не меняет сохранённую заметку', () => {
    const store = useNotesStore()
    store.save(note, true)
    const draft = copyNote(note)
    const todo = draft.todos[0]
    if (!todo) throw new Error('Нет тестовой задачи')
    todo.text = 'Хлеб'
    expect(store.notes[0]?.todos[0]?.text).toBe('Молоко')
    expect(storage.setItem).toHaveBeenCalledTimes(1)
    store.save(draft)
    expect(store.notes[0]?.todos[0]?.text).toBe('Хлеб')
    todo.text = 'Сыр'
    expect(store.notes[0]?.todos[0]?.text).toBe('Хлеб')
  })

  it('сохраняет чужие изменения перед записью', () => {
    const store = useNotesStore()
    store.save(note, true)
    const other = { id: 'two', title: 'Другая', todos: [] }
    data.set(NOTES_KEY, JSON.stringify({ version: 1, notes: [note, other] }))
    store.save({ ...note, title: 'Новое название' })
    expect(store.notes.map((item) => item.id)).toEqual(['one', 'two'])
  })

  it('не восстанавливает удалённую в другой вкладке заметку', () => {
    const store = useNotesStore()
    store.save(note, true)
    data.set(NOTES_KEY, JSON.stringify({ version: 1, notes: [] }))
    expect(store.save(note)).toBe(false)
    expect(store.notes).toEqual([])
    expect(store.error).toContain('удалена')
    expect(storage.setItem).toHaveBeenCalledTimes(1)
  })

  it('удаляет заметку и переносит внешнее удаление в стор', () => {
    const store = useNotesStore()
    store.save(note, true)
    expect(store.remove(note.id)).toBe(true)
    expect(store.notes).toEqual([])
    store.save(note, true)
    data.delete(NOTES_KEY)
    store.load()
    expect(store.notes).toEqual([])
  })

  it.each(['broken', '{"version":2,"notes":[]}', '{"version":1,"notes":[{}]}'])(
    'не перезаписывает повреждённые данные: %s',
    (raw) => {
      data.set(NOTES_KEY, raw)
      const store = useNotesStore()
      store.load()
      expect(store.error).not.toBe('')
      expect(store.save(note, true)).toBe(false)
      expect(data.get(NOTES_KEY)).toBe(raw)
    },
  )

  it('не меняет стор, если запись не удалась', () => {
    storage.setItem.mockImplementation(() => {
      throw new Error('quota')
    })
    const store = useNotesStore()
    expect(store.save(note, true)).toBe(false)
    expect(store.notes).toEqual([])
    expect(store.error).toContain('Не удалось сохранить')
  })
})
