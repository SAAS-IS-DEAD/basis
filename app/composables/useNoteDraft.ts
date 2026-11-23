import { onBeforeUnmount, onMounted, type Ref, ref, watch } from 'vue'
import { DRAFT_KEY, DRAFT_SAVE_DELAY, STORAGE_VERSION } from '@/constants/notes'
import { copyNote, isNote } from '@/domain/note'
import type { Note } from '@/types/note'

interface DraftOptions {
  id?: string
  note: Note
  dirty: Readonly<Ref<boolean>>
  missing: Readonly<Ref<boolean>>
  allowLeave: Readonly<Ref<boolean>>
}

export function useNoteDraft({
  id,
  note,
  dirty,
  missing,
  allowLeave,
}: DraftOptions) {
  const key = `${DRAFT_KEY}${id ?? 'new'}`
  const restoreOpen = ref(false)
  const error = ref('')
  let savedDraft: Note | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  function clearDraft() {
    clearTimeout(timer)
    try {
      sessionStorage.removeItem(key)
    } catch {
      error.value = 'Не удалось удалить черновик.'
    }
  }

  function persist() {
    clearTimeout(timer)
    if (allowLeave.value || missing.value || restoreOpen.value) return
    try {
      if (dirty.value) {
        const data = { version: STORAGE_VERSION, note }
        sessionStorage.setItem(key, JSON.stringify(data))
      } else sessionStorage.removeItem(key)
      error.value = ''
    } catch {
      error.value = 'Черновик не сохранён: хранилище недоступно.'
    }
  }

  function restoreDraft() {
    if (savedDraft) Object.assign(note, copyNote(savedDraft))
  }

  function visibility() {
    if (document.hidden) persist()
  }

  watch(
    note,
    () => {
      clearTimeout(timer)
      timer = setTimeout(persist, DRAFT_SAVE_DELAY)
    },
    { deep: true },
  )

  watch(restoreOpen, (open) => {
    if (!open) clearDraft()
  })

  onMounted(() => {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw && !missing.value) {
        const data = JSON.parse(raw)
        if (
          data?.version === STORAGE_VERSION &&
          isNote(data.note) &&
          (!id || data.note.id === id)
        ) {
          savedDraft = data.note
          restoreOpen.value = true
        } else clearDraft()
      }
    } catch {
      error.value = 'Не удалось прочитать черновик.'
    }
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', visibility)
  })

  onBeforeUnmount(() => {
    persist()
    clearTimeout(timer)
    window.removeEventListener('pagehide', persist)
    document.removeEventListener('visibilitychange', visibility)
  })

  return { restoreOpen, error, clearDraft, restoreDraft }
}
