import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NOTES_KEY, STORAGE_VERSION } from '@/constants/notes'
import { copyNote, isNote } from '@/domain/note'
import type { Note } from '@/types/note'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loaded = ref(false)
  const error = ref('')

  function read(): Note[] | null {
    try {
      const raw = localStorage.getItem(NOTES_KEY)
      if (!raw) return []
      const data = JSON.parse(raw)
      if (
        data?.version !== STORAGE_VERSION ||
        !Array.isArray(data.notes) ||
        !data.notes.every(isNote) ||
        new Set(data.notes.map((note: Note) => note.id)).size !==
          data.notes.length
      ) {
        error.value = 'Не удалось прочитать заметки: неизвестный формат данных.'
        return null
      }
      return data.notes
    } catch {
      error.value = 'Хранилище недоступно или данные повреждены.'
      return null
    }
  }

  function load() {
    error.value = ''
    const saved = read()
    if (saved) notes.value = saved
    loaded.value = true
  }

  function write(next: Note[]) {
    try {
      const data = { version: STORAGE_VERSION, notes: next }
      localStorage.setItem(NOTES_KEY, JSON.stringify(data))
      notes.value = next
      error.value = ''
      return true
    } catch {
      error.value =
        'Не удалось сохранить заметки. Проверьте доступ к хранилищу.'
      return false
    }
  }

  function save(note: Note, create = false) {
    const saved = read()
    if (!saved) return false
    if (!create && !saved.some((item) => item.id === note.id)) {
      notes.value = saved
      error.value = 'Заметка уже удалена в другой вкладке.'
      return false
    }
    const next = saved.filter((item) => item.id !== note.id)
    const index = saved.findIndex((item) => item.id === note.id)
    next.splice(Math.max(index, 0), 0, copyNote(note))
    return write(next)
  }

  function remove(id: string) {
    const saved = read()
    return saved ? write(saved.filter((note) => note.id !== id)) : false
  }

  return { notes, loaded, error, load, save, remove }
})
