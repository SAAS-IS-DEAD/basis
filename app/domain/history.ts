import { HISTORY_LIMIT } from '@/constants/notes'
import type { Note, Todo } from '@/types/note'

type TextChange = {
  type: 'text'
  id: string | null
  before: string
  after: string
}

type Change =
  | TextChange
  | { type: 'done'; id: string; before: boolean; after: boolean }
  | { type: 'add' | 'remove'; todo: Todo; index: number }

export class NoteHistory {
  past: Change[] = []
  future: Change[] = []
  pending: TextChange | undefined

  constructor(public note: Note) {}

  get canUndo() {
    return (
      this.past.length > 0 ||
      (!!this.pending && this.pending.before !== this.pending.after)
    )
  }
  get canRedo() {
    return this.future.length > 0
  }

  text(id: string | null, value: string) {
    const before =
      id === null
        ? this.note.title
        : this.note.todos.find((todo) => todo.id === id)?.text
    if (before === undefined || before === value) return
    if (this.pending?.id !== id) this.commit()
    this.pending = {
      type: 'text',
      id,
      before: this.pending?.before ?? before,
      after: value,
    }
    this.future = []
    this.apply(this.pending)
  }

  commit() {
    if (this.pending && this.pending.before !== this.pending.after)
      this.push(this.pending)
    this.pending = undefined
  }

  done(id: string, value: boolean) {
    const todo = this.note.todos.find((item) => item.id === id)
    if (todo && todo.done !== value)
      this.execute({ type: 'done', id, before: todo.done, after: value })
  }

  add(todo: Todo) {
    this.execute({
      type: 'add',
      todo: { ...todo },
      index: this.note.todos.length,
    })
  }

  remove(id: string) {
    this.commit()
    const index = this.note.todos.findIndex((todo) => todo.id === id)
    const todo = this.note.todos[index]
    if (todo) this.execute({ type: 'remove', todo: { ...todo }, index })
  }

  execute(change: Change) {
    this.commit()
    this.apply(change)
    this.push(change)
    this.future = []
  }

  push(change: Change) {
    this.past.push(change)
    if (this.past.length > HISTORY_LIMIT) this.past.shift()
  }

  apply(change: Change, undo = false) {
    if (change.type === 'text') {
      const value = undo ? change.before : change.after
      if (change.id === null) this.note.title = value
      else {
        const todo = this.note.todos.find((item) => item.id === change.id)
        if (todo) todo.text = value
      }
    } else if (change.type === 'done') {
      const todo = this.note.todos.find((item) => item.id === change.id)
      if (todo) todo.done = undo ? change.before : change.after
    } else if ((change.type === 'add') !== undo) {
      this.note.todos.splice(change.index, 0, { ...change.todo })
    } else {
      this.note.todos.splice(change.index, 1)
    }
  }

  undo() {
    this.commit()
    const change = this.past.pop()
    if (!change) return
    this.apply(change, true)
    this.future.push(change)
  }

  redo() {
    const change = this.future.pop()
    if (!change) return
    this.apply(change)
    this.push(change)
  }

  clear() {
    this.past = []
    this.future = []
    this.pending = undefined
  }
}
