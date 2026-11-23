<script setup lang="ts">
import BaseButton from '@/components/ui/Button/BaseButton.vue'
import BaseCheckbox from '@/components/ui/Checkbox/BaseCheckbox.vue'
import { TODO_PREVIEW_LIMIT } from '@/constants/notes'
import type { Note } from '@/types/note'

defineProps<{ note: Note }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <article class="note-card">
    <h2 class="note-card__title">{{ note.title }}</h2>
    <ul v-if="note.todos.length" class="note-card__list">
      <li
        v-for="todo in note.todos.slice(0, TODO_PREVIEW_LIMIT)"
        :key="todo.id"
      >
        <BaseCheckbox :model-value="todo.done" :label="todo.text" disabled />
      </li>
    </ul>
    <p v-else class="note-card__empty">Нет задач</p>
    <p v-if="note.todos.length > TODO_PREVIEW_LIMIT" class="note-card__empty">
      Ещё {{ note.todos.length - TODO_PREVIEW_LIMIT }}
    </p>
    <footer class="note-card__actions">
      <NuxtLink class="link" :to="`/editor/${note.id}`">Изменить</NuxtLink>
      <BaseButton size="small" variant="secondary" @click="$emit('remove')">
        Удалить
      </BaseButton>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.note-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
  font-family: var(--ui-font-family);
  line-height: 1.5;
  overflow-wrap: anywhere;

  &__title {
    margin: 0 0 16px;
    font-size: 18px;
  }

  &__list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__empty {
    margin: 0;
    color: var(--ui-color-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
  }
}
</style>
