<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{ label: string; error?: string }>()
const model = defineModel<string>({ required: true })
const inputId = useId()
const messageId = useId()
</script>

<template>
  <div class="input" :class="{ 'input--invalid': error }">
    <label class="input__label" :for="inputId">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="inputId"
      v-model="model"
      class="input__control"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="
        [error ? messageId : '', $attrs['aria-describedby']]
          .filter(Boolean)
          .join(' ') || undefined
      "
    />
    <p
      v-if="error"
      :id="messageId"
      class="input__message"
      aria-live="polite"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.input {
  display: grid;
  gap: 6px;
  color: var(--ui-color-text);
  font-family: var(--ui-font-family);

  &__label {
    font-weight: 500;
  }

  &__control {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius);
    background: var(--ui-color-surface);
    color: inherit;
    font: inherit;
    line-height: 1.5;

    &::placeholder {
      color: var(--ui-color-muted);
    }
    &:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 2px;
    }
    &:disabled {
      background: var(--ui-color-disabled);
      cursor: not-allowed;
    }
  }

  &__message {
    margin: 0;
    color: var(--ui-color-danger);
    font-size: 14px;
  }
  &--invalid &__control {
    border-color: var(--ui-color-danger);
  }
}
</style>
