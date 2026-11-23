<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <section class="empty-state">
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__actions"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
.empty-state {
  padding: 32px 16px;
  color: var(--ui-color-text);
  font-family: var(--ui-font-family);
  text-align: center;
  overflow-wrap: anywhere;

  &__title {
    margin: 0;
    font-size: 20px;
  }
  &__description {
    margin: 12px 0 0;
    color: var(--ui-color-muted);
    line-height: 1.5;
  }
  &__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
