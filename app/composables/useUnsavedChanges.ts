import { type Ref, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

interface LeaveOptions {
  dirty: Readonly<Ref<boolean>>
  missing: Readonly<Ref<boolean>>
  flush: () => void
}

export function useUnsavedChanges({ dirty, missing, flush }: LeaveOptions) {
  const cancelOpen = ref(false)
  const allowLeave = ref(false)
  let leaveDecision: ((value: boolean) => void) | undefined

  function confirmLeave() {
    if (!leaveDecision) return false
    leaveDecision(true)
    leaveDecision = undefined
    return true
  }

  watch(cancelOpen, (open) => {
    if (!open && leaveDecision) {
      leaveDecision(false)
      leaveDecision = undefined
    }
  })

  onBeforeRouteLeave(() => {
    if (allowLeave.value || !dirty.value || missing.value) return true
    flush()
    cancelOpen.value = true
    return new Promise<boolean>((resolve) => {
      leaveDecision = resolve
    })
  })

  return { cancelOpen, allowLeave, confirmLeave }
}
