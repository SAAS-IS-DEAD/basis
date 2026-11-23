<script setup lang="ts">
import BaseButton from '@/components/ui/Button/BaseButton.vue'
import BaseCheckbox from '@/components/ui/Checkbox/BaseCheckbox.vue'
import BaseInput from '@/components/ui/Input/BaseInput.vue'
import type { Todo } from '@/types/note'

defineProps<{ todo: Todo; index: number; error?: string }>()
defineEmits<{
  text: [value: string]
  done: [value: boolean]
  remove: []
  blur: []
}>()
</script>

<template>
  <li class="todo-row">
    <BaseInput
      :label="`Задача ${index + 1}`"
      :model-value="todo.text"
      :error="error"
      @update:model-value="$emit('text', $event)"
      @blur="$emit('blur')"
    />
    <div class="todo-row__actions">
      <BaseCheckbox
        :label="`Выполнена задача ${index + 1}`"
        :model-value="todo.done"
        @update:model-value="$emit('done', $event)"
      />
      <BaseButton size="small" variant="secondary" @click="$emit('remove')">
        Удалить задачу {{ index + 1 }}
      </BaseButton>
    </div>
  </li>
</template>

<style scoped lang="scss">
.todo-row {
  padding: 16px;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }
}
</style>
