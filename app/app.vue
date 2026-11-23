<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { NOTES_KEY } from '@/constants/notes'
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()

function sync(event: StorageEvent) {
  if (
    event.storageArea === localStorage &&
    (event.key === NOTES_KEY || event.key === null)
  )
    store.load()
}

onMounted(() => {
  store.load()
  window.addEventListener('storage', sync)
})
onBeforeUnmount(() => window.removeEventListener('storage', sync))
</script>

<template>
  <main class="app">
    <p v-if="store.error" class="error" role="alert">{{ store.error }}</p>
    <NuxtPage v-if="store.loaded" :page-key="(route) => route.path" />
  </main>
</template>

<style scoped lang="scss">
.app {
  max-width: 1024px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: var(--ui-font-family);
}
</style>
