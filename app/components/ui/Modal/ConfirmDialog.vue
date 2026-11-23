<script setup lang="ts">
import BaseButton from '@/components/ui/Button/BaseButton.vue'
import BaseModal from '@/components/ui/Modal/BaseModal.vue'

withDefaults(
  defineProps<{
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }>(),
  { confirmText: 'Подтвердить', cancelText: 'Отмена' },
)

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ confirm: [] }>()

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <BaseModal v-model:open="open" :title="title" :description="description">
    <template #footer>
      <BaseButton variant="secondary" autofocus @click="open = false">
        {{ cancelText }}
      </BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'primary'" @click="confirm">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
