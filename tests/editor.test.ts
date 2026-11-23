import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  RouterLink,
  RouterView,
} from 'vue-router'
import { DRAFT_KEY, DRAFT_SAVE_DELAY, STORAGE_VERSION } from '@/constants/notes'
import Editor from '@/pages/editor/[[id]].vue'
import { useNotesStore } from '@/stores/notes'

const note = {
  id: 'one',
  title: 'Покупки',
  todos: [{ id: 'milk', text: 'Молоко', done: false }],
}
const draftKey = `${DRAFT_KEY}${note.id}`
let wrapper: VueWrapper
let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  pinia = createPinia()
  setActivePinia(pinia)
  useNotesStore().save(note, true)
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  wrapper?.unmount()
  document.body.replaceChildren()
  vi.useRealTimers()
})

async function openEditor() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => h('p', 'Заметки') } },
      { path: '/editor/:id', component: Editor },
    ],
  })
  await router.push('/editor/one')
  const store = useNotesStore()
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), {
    attachTo: document.body,
    global: { plugins: [pinia, router], components: { NuxtLink: RouterLink } },
  })
  await flushPromises()
  return { router, store }
}

function button(text: string) {
  const found = wrapper.findAll('button').find((item) => item.text() === text)
  if (!found) throw new Error(`Нет кнопки: ${text}`)
  return found
}

it('проверяет поля и сохраняет изменения только после отправки формы', async () => {
  const { router, store } = await openEditor()
  await wrapper.get('input:not([type])').setValue(' ')
  await wrapper.get('form').trigger('submit')
  expect(wrapper.text()).toContain('Введите название')
  await wrapper.get('input:not([type])').setValue(' Продукты ')
  await button('Добавить задачу').trigger('click')
  await wrapper.get('form').trigger('submit')
  expect(wrapper.text()).toContain('Введите текст задачи')
  await wrapper.get('li:last-child input:not([type])').setValue(' Хлеб ')
  expect(store.notes).toEqual([note])
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/')
  expect(store.notes[0]?.title).toBe('Продукты')
  expect(store.notes[0]?.todos[1]?.text).toBe('Хлеб')
  expect(sessionStorage.getItem(draftKey)).toBeNull()
})

it('восстанавливает черновик без старой истории и сохраняет его', async () => {
  sessionStorage.setItem(
    draftKey,
    JSON.stringify({
      version: STORAGE_VERSION,
      note: { ...note, title: 'Черновик' },
    }),
  )
  const { store } = await openEditor()
  expect(wrapper.get('dialog[open]').text()).toContain('Восстановить черновик?')
  await button('Восстановить').trigger('click')
  expect(wrapper.get<HTMLInputElement>('input:not([type])').element.value).toBe(
    'Черновик',
  )
  expect(button('Отменить изменение').attributes('disabled')).toBeDefined()
  await vi.advanceTimersByTimeAsync(DRAFT_SAVE_DELAY)
  expect(JSON.parse(sessionStorage.getItem(draftKey) ?? '').note.title).toBe(
    'Черновик',
  )
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(store.notes[0]?.title).toBe('Черновик')
  expect(sessionStorage.getItem(draftKey)).toBeNull()
})

it('оставляет исходную заметку при отказе от восстановления', async () => {
  sessionStorage.setItem(
    draftKey,
    JSON.stringify({
      version: STORAGE_VERSION,
      note: { ...note, title: 'Черновик' },
    }),
  )
  await openEditor()
  await button('Не восстанавливать').trigger('click')
  expect(wrapper.get<HTMLInputElement>('input:not([type])').element.value).toBe(
    'Покупки',
  )
  expect(sessionStorage.getItem(draftKey)).toBeNull()
  expect(wrapper.find('dialog[open]').exists()).toBe(false)
})

it('отменяет переход при закрытии диалога и удаляет черновик после подтверждения', async () => {
  const { router, store } = await openEditor()
  await wrapper.get('input:not([type])').setValue('Не сохранять')
  await vi.advanceTimersByTimeAsync(DRAFT_SAVE_DELAY)
  expect(JSON.parse(sessionStorage.getItem(draftKey) ?? '').note.title).toBe(
    'Не сохранять',
  )
  const firstLeave = router.push('/')
  await flushPromises()
  await wrapper.get('dialog[open]').trigger('cancel')
  await firstLeave
  expect(router.currentRoute.value.path).toBe('/editor/one')
  expect(wrapper.get<HTMLInputElement>('input:not([type])').element.value).toBe(
    'Не сохранять',
  )
  const secondLeave = router.push('/')
  await flushPromises()
  await button('Не сохранять').trigger('click')
  await secondLeave
  expect(router.currentRoute.value.path).toBe('/')
  expect(store.notes).toEqual([note])
  expect(sessionStorage.getItem(draftKey)).toBeNull()
})

it('удаляет заметку только после подтверждения в диалоге', async () => {
  const { router, store } = await openEditor()
  await button('Удалить заметку').trigger('click')
  await wrapper.get('dialog[open]').trigger('cancel')
  expect(store.notes).toEqual([note])
  await button('Удалить заметку').trigger('click')
  await button('Удалить').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/')
  expect(store.notes).toEqual([])
})

it('отменяет чекбокс с клавиатуры, не перехватывая undo в поле ввода', async () => {
  await openEditor()
  const checkbox = wrapper.get<HTMLInputElement>('input[type="checkbox"]')
  await checkbox.setValue(true)
  await checkbox.trigger('keydown', { key: 'z', ctrlKey: true })
  expect(checkbox.element.checked).toBe(false)
  await checkbox.trigger('keydown', { key: 'z', ctrlKey: true, shiftKey: true })
  expect(checkbox.element.checked).toBe(true)
  const event = new KeyboardEvent('keydown', {
    key: 'z',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  wrapper.get('input:not([type])').element.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(false)
  expect(checkbox.element.checked).toBe(true)
})
