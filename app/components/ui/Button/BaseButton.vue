<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/constants/variants'

type ButtonVariants = VariantProps<typeof buttonVariants>

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: NonNullable<ButtonVariants['variant']>
    size?: NonNullable<ButtonVariants['size']>
  }>(),
  { type: 'button', disabled: false },
)
</script>

<template>
  <button
    :class="buttonVariants({ variant, size })"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--ui-radius);
  font: inherit;
  font-family: var(--ui-font-family);
  cursor: pointer;
  line-height: 1.5;

  &--danger {
    background: var(--ui-color-danger);
    color: #fff;

    &:hover:not(:disabled) {
      background: var(--ui-color-danger-hover);
    }
  }

  &--primary {
    background: var(--ui-color-accent);
    color: #fff;

    &:hover:not(:disabled) {
      background: var(--ui-color-accent-hover);
    }
  }

  &--secondary {
    background: transparent;
    color: var(--ui-color-accent);
    box-shadow: inset 0 0 0 1px currentColor;

    &:hover:not(:disabled) {
      background: var(--ui-color-accent-soft);
    }
  }

  &--small {
    padding: 6px 12px;
    font-size: 14px;
  }

  &--medium {
    padding: 10px 16px;
    font-size: 16px;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
