<script setup lang="ts">
import { ref } from 'vue'
import NoteCard from '@/components/notes/NoteCard.vue'
import EmptyState from '@/components/ui/EmptyState/EmptyState.vue'
import ConfirmDialog from '@/components/ui/Modal/ConfirmDialog.vue'
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()
const selected = ref('')
const deleteOpen = ref(false)

function askDelete(id: string) {
  selected.value = id
  deleteOpen.value = true
}
</script>

<template>
  <section class="notes">
    <header class="notes__header">
      <h1>Заметки</h1>
      <NuxtLink class="link" to="/editor">Создать заметку</NuxtLink>
    </header>
    <div v-if="store.notes.length" class="notes__list">
      <NoteCard
        v-for="note in store.notes"
        :key="note.id"
        :note="note"
        @remove="askDelete(note.id)"
      />
    </div>
    <EmptyState
      v-else
      title="Пока нет заметок"
      description="Создайте заметку и добавьте задачи."
    />
    <ConfirmDialog
      v-model:open="deleteOpen"
      title="Удалить заметку?"
      description="Восстановить её не получится."
      confirm-text="Удалить"
      danger
      @confirm="store.remove(selected)"
    />
  </section>
</template>

<style scoped lang="scss">
.notes {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
  }
}
</style>
