import { describe, expect, it } from 'vitest'
import { NoteHistory } from '@/domain/history'
import type { Note } from '@/types/note'

function setup() {
  const note: Note = {
    id: 'note',
    title: '',
    todos: [{ id: 'a', text: 'Первая', done: false }],
  }
  return { note, history: new NoteHistory(note) }
}

describe('история', () => {
  it('объединяет ввод в одном поле', () => {
    const { note, history } = setup()
    history.text(null, 'П')
    history.text(null, 'По')
    history.text(null, 'Покупки')
    history.commit()
    expect(history.past).toHaveLength(1)
    history.undo()
    expect(note.title).toBe('')
    history.redo()
    expect(note.title).toBe('Покупки')
  })

  it('разделяет поля и ввод после фиксации', () => {
    const { note, history } = setup()
    history.text(null, 'Название')
    history.text('a', 'Вторая')
    history.commit()
    history.text('a', 'Третья')
    history.undo()
    expect(note.todos[0]?.text).toBe('Вторая')
    history.undo()
    expect(note.todos[0]?.text).toBe('Первая')
    history.undo()
    expect(note.title).toBe('')
  })

  it('фиксирует чекбокс отдельно от ввода', () => {
    const { note, history } = setup()
    history.text('a', 'Молоко')
    history.done('a', true)
    history.undo()
    expect(note.todos[0]).toEqual({ id: 'a', text: 'Молоко', done: false })
    history.undo()
    expect(note.todos[0]?.text).toBe('Первая')
  })

  it('восстанавливает удалённый пункт на прежнем месте', () => {
    const { note, history } = setup()
    history.add({ id: 'b', text: 'Вторая', done: true })
    history.text('a', 'Изменённая')
    history.remove('a')
    expect(note.todos.map((todo) => todo.id)).toEqual(['b'])
    history.undo()
    expect(note.todos[0]).toEqual({ id: 'a', text: 'Изменённая', done: false })
    history.undo()
    expect(note.todos[0]?.text).toBe('Первая')
    history.redo()
    history.redo()
    expect(note.todos.map((todo) => todo.id)).toEqual(['b'])
  })

  it('не меняет сохранённую операцию добавления при редактировании', () => {
    const { note, history } = setup()
    history.add({ id: 'b', text: '', done: false })
    history.text('b', 'Хлеб')
    history.undo()
    history.undo()
    history.redo()
    expect(note.todos[1]?.text).toBe('')
    history.redo()
    expect(note.todos[1]?.text).toBe('Хлеб')
  })

  it('очищает redo сразу при новом вводе', () => {
    const { note, history } = setup()
    history.text(null, 'Первое')
    history.undo()
    expect(history.canRedo).toBe(true)
    history.text(null, 'Другое')
    expect(history.canRedo).toBe(false)
    history.redo()
    expect(note.title).toBe('Другое')
  })

  it('не записывает ввод, вернувшийся к исходному значению', () => {
    const { history } = setup()
    history.text(null, 'Текст')
    history.text(null, '')
    expect(history.canUndo).toBe(false)
    history.commit()
    expect(history.past).toEqual([])
  })

  it('хранит только 50 операций', () => {
    const { note, history } = setup()
    for (let i = 1; i <= 60; i++) {
      history.text(null, String(i))
      history.commit()
    }
    expect(history.past).toHaveLength(50)
    expect(history.past[0]).toEqual({
      type: 'text',
      id: null,
      before: '10',
      after: '11',
    })
    for (let i = 0; i < 60; i++) history.undo()
    expect(note.title).toBe('10')
  })

  it('сбрасывает историю без изменения заметки', () => {
    const { note, history } = setup()
    history.text(null, 'Название')
    history.clear()
    history.undo()
    expect(note.title).toBe('Название')
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })
})
