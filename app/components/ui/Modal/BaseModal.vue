<script setup lang="ts">
import { useId, useTemplateRef, watchEffect } from 'vue'

defineProps<{ title: string; description?: string }>()
const open = defineModel<boolean>('open', { required: true })
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const titleId = useId()
const descriptionId = useId()

watchEffect(
  () => {
    const element = dialog.value
    if (!element) return
    if (open.value && !element.open) element.showModal()
    if (!open.value && element.open) element.close()
  },
  { flush: 'post' },
)

function trapFocus(event: KeyboardEvent) {
  const elements = Array.from(
    dialog.value?.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, a[href], [tabindex], [contenteditable="true"]',
    ) ?? [],
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.getClientRects().length,
  )
  const first = elements[0]
  const last = elements.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    @cancel.prevent="open = false"
    @close="open = false"
    @keydown.tab="trapFocus"
  >
    <header class="modal__header">
      <h2 :id="titleId" class="modal__title">{{ title }}</h2>
      <button
        class="modal__close"
        type="button"
        aria-label="Закрыть"
        @click="open = false"
      >
        <span aria-hidden="true">×</span>
      </button>
    </header>
    <p v-if="description" :id="descriptionId" class="modal__description">
      {{ description }}
    </p>
    <footer v-if="$slots.footer" class="modal__footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style scoped lang="scss">
.modal {
  box-sizing: border-box;
  width: min(480px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 24px;
  overflow: auto;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius);
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
  font-family: var(--ui-font-family);
  line-height: 1.5;
  box-shadow: 0 16px 64px #0003;

  &::backdrop {
    background: #151a2b99;
  }
  &__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  &__title {
    flex: 1;
    margin: 0;
    font-size: 20px;
    overflow-wrap: anywhere;
  }

  &__close {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: var(--ui-radius);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 24px;
    cursor: pointer;

    &:hover {
      background: var(--ui-color-disabled);
    }
    &:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 2px;
    }
  }

  &__description {
    margin: 16px 0 0;
    color: var(--ui-color-muted);
    overflow-wrap: anywhere;
  }
  &__footer {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
}
</style>
