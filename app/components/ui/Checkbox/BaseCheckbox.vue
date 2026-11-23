<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{ label: string; disabled?: boolean }>()
const model = defineModel<boolean>({ required: true })
const inputId = useId()
</script>

<template>
  <label
    class="checkbox"
    :class="{ 'checkbox--disabled': disabled }"
    :for="inputId"
  >
    <input
      v-bind="$attrs"
      :id="inputId"
      v-model="model"
      class="checkbox__control"
      type="checkbox"
      :disabled="disabled"
    />
    <span class="checkbox__label">{{ label }}</span>
  </label>
</template>

<style scoped lang="scss">
.checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--ui-color-text);
  font-family: var(--ui-font-family);
  line-height: 1.5;
  cursor: pointer;

  &__control {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: 3px 0 0;
    accent-color: var(--ui-color-accent);
    cursor: inherit;

    &:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 3px;
    }
  }

  &__label {
    overflow-wrap: anywhere;
  }
  &--disabled {
    color: var(--ui-color-muted);
    cursor: not-allowed;
  }
}
</style>
