<script setup lang="ts">
import { useRoute } from 'vue-router'
import TodoRow from '@/components/notes/TodoRow.vue'
import BaseButton from '@/components/ui/Button/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState/EmptyState.vue'
import BaseInput from '@/components/ui/Input/BaseInput.vue'
import ConfirmDialog from '@/components/ui/Modal/ConfirmDialog.vue'
import { useNoteEditor } from '@/composables/useNoteEditor'

const route = useRoute()
const id =
  typeof route.params.id === 'string' && route.params.id
    ? route.params.id
    : undefined
const {
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
} = useNoteEditor(id)

function addTodo() {
  history.add({ id: crypto.randomUUID(), text: '', done: false })
}
</script>

<template>
  <section class="editor">
    <EmptyState
      v-if="missing"
      title="Заметка не найдена"
      description="Возможно, её удалили в другой вкладке."
    >
      <NuxtLink class="link" to="/">К заметкам</NuxtLink>
    </EmptyState>
    <template v-else>
      <header class="editor__header">
        <NuxtLink class="link" to="/">К заметкам</NuxtLink>
        <h1>{{ id ? 'Редактирование' : 'Новая заметка' }}</h1>
        <span class="editor__status">
          {{ dirty ? 'Есть несохранённые изменения' : 'Нет изменений' }}
        </span>
      </header>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <form class="editor__form" @submit.prevent="save">
        <BaseInput
          label="Название"
          :model-value="note.title"
          :error="
            attempted && !note.title.trim() ? 'Введите название' : undefined
          "
          @update:model-value="text(null, $event)"
          @blur="flush"
        />
        <div class="editor__history">
          <BaseButton
            size="small"
            variant="secondary"
            :disabled="!history.canUndo"
            @click="history.undo()"
          >
            Отменить изменение
          </BaseButton>
          <BaseButton
            size="small"
            variant="secondary"
            :disabled="!history.canRedo"
            @click="history.redo()"
          >
            Повторить изменение
          </BaseButton>
        </div>
        <ul class="editor__todos">
          <TodoRow
            v-for="(todo, index) in note.todos"
            :key="todo.id"
            :todo="todo"
            :index="index"
            :error="
              attempted && !todo.text.trim()
                ? 'Введите текст задачи'
                : undefined
            "
            @text="text(todo.id, $event)"
            @done="history.done(todo.id, $event)"
            @remove="history.remove(todo.id)"
            @blur="flush"
          />
        </ul>
        <BaseButton class="editor__add" variant="secondary" @click="addTodo">
          Добавить задачу
        </BaseButton>
        <footer class="editor__actions">
          <BaseButton type="submit">Сохранить</BaseButton>
          <BaseButton variant="secondary" @click="cancelOpen = true">
            Отменить редактирование
          </BaseButton>
          <BaseButton v-if="id" variant="danger" @click="deleteOpen = true">
            Удалить заметку
          </BaseButton>
        </footer>
      </form>
    </template>
    <ConfirmDialog
      v-model:open="cancelOpen"
      title="Отменить редактирование?"
      description="Несохранённые изменения будут потеряны."
      confirm-text="Не сохранять"
      danger
      @confirm="cancel"
    />
    <ConfirmDialog
      v-model:open="deleteOpen"
      title="Удалить заметку?"
      description="Восстановить её не получится."
      confirm-text="Удалить"
      danger
      @confirm="remove"
    />
    <ConfirmDialog
      v-model:open="restoreOpen"
      title="Восстановить черновик?"
      description="Есть несохранённые изменения."
      confirm-text="Восстановить"
      cancel-text="Не восстанавливать"
      @confirm="restore"
    />
  </section>
</template>

<style scoped lang="scss">
.editor {
  max-width: 720px;
  margin: 0 auto;

  &__header {
    display: grid;
    justify-items: start;
    gap: 12px;
    margin-bottom: 24px;
  }
  &__status {
    color: var(--ui-color-muted);
    font-size: 14px;
  }
  &__form {
    display: grid;
    gap: 20px;
  }
  &__history,
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  &__todos {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__add {
    justify-self: start;
  }
  &__actions {
    padding-top: 16px;
    border-top: 1px solid var(--ui-color-border);
  }
}
</style>
