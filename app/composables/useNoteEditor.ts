import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteDraft } from '@/composables/useNoteDraft'
import { useNoteHistory } from '@/composables/useNoteHistory'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { copyNote } from '@/domain/note'
import { useNotesStore } from '@/stores/notes'

export function useNoteEditor(id?: string) {
  const store = useNotesStore()
  const router = useRouter()
  const original = copyNote(
    store.notes.find((note) => note.id === id) ?? {
      id: id ?? crypto.randomUUID(),
      title: '',
      todos: [],
    },
  )
  const note = reactive(copyNote(original))
  const missing = computed(
    () => !!id && !store.notes.some((item) => item.id === id),
  )
  const dirty = computed(
    () => JSON.stringify(note) !== JSON.stringify(original),
  )
  const attempted = ref(false)
  const deleteOpen = ref(false)
  const { history, text, flush } = useNoteHistory(note)
  const { cancelOpen, allowLeave, confirmLeave } = useUnsavedChanges({
    dirty,
    missing,
    flush,
  })
  const { restoreOpen, error, clearDraft, restoreDraft } = useNoteDraft({
    id,
    note,
    dirty,
    missing,
    allowLeave,
  })

  function restore() {
    restoreDraft()
    history.clear()
  }

  function finish() {
    allowLeave.value = true
    clearDraft()
    history.clear()
  }

  function save() {
    flush()
    attempted.value = true
    if (!note.title.trim() || note.todos.some((todo) => !todo.text.trim()))
      return
    const next = {
      ...note,
      title: note.title.trim(),
      todos: note.todos.map((todo) => ({ ...todo, text: todo.text.trim() })),
    }
    if (!store.save(next, !id)) return
    finish()
    router.push('/')
  }

  function cancel() {
    finish()
    if (!confirmLeave()) router.push('/')
  }

  function remove() {
    if (!store.remove(note.id)) return
    finish()
    router.push('/')
  }

  watch(missing, (value) => {
    if (value) {
      clearDraft()
      history.clear()
    }
  })

  return {
    note,
    history,
    missing,
    dirty,
    attempted,
    error,
    cancelOpen,
    deleteOpen,
    restoreOpen,
    text,
    flush,
    restore,
    save,
    cancel,
    remove,
  }
}
