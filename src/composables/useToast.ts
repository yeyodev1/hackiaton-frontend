import { ref, readonly } from 'vue'

type ToastType = 'success' | 'error' | 'info' | 'warning'

const isVisible = ref(false)
const message = ref('')
const toastType = ref<ToastType>('info')
let timeoutId: number | undefined

export function useToast() {
  const triggerToast = (
    newMessage: string,
    type: ToastType = 'success',
    duration: number = 3000,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    message.value = newMessage
    toastType.value = type
    isVisible.value = true

    timeoutId = window.setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  return {
    isVisible: readonly(isVisible),
    message: readonly(message),
    toastType: readonly(toastType),
    triggerToast,
  }
}
