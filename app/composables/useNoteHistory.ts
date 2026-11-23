import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { TEXT_COMMIT_DELAY } from '@/constants/notes'
import { NoteHistory } from '@/domain/history'
import type { Note } from '@/types/note'

export function useNoteHistory(note: Note) {
  const history = reactive(new NoteHistory(note))
  let timer: ReturnType<typeof setTimeout> | undefined

  function flush() {
    clearTimeout(timer)
    history.commit()
  }

  function text(id: string | null, value: string) {
    history.text(id, value)
    clearTimeout(timer)
    timer = setTimeout(flush, TEXT_COMMIT_DELAY)
  }

  function shortcut(event: KeyboardEvent) {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest(
        'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], dialog',
      )
    )
      return
    if (
      !(event.ctrlKey || event.metaKey) ||
      event.altKey ||
      event.key.toLowerCase() !== 'z'
    )
      return
    event.preventDefault()
    flush()
    if (event.shiftKey) history.redo()
    else history.undo()
  }

  onMounted(() => window.addEventListener('keydown', shortcut))
  onBeforeUnmount(() => {
    flush()
    window.removeEventListener('keydown', shortcut)
  })

  return { history, text, flush }
}
