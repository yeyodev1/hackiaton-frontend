import { ref, readonly, computed, shallowRef } from 'vue'

interface SelectionOption {
  [key: string]: any
}

const isVisible = ref(false)
const title = ref('')
const message = ref('')
const confirmationText = ref<string | null>(null)
const userInput = ref('')

// AÑADIDO: Estado para la lista de selección
const selectionConfig = ref<{
  label: string
  items: SelectionOption[]
  displayField: string
  valueField: string
} | null>(null)
const selectedValue = ref<string | null>(null)

// El tipo de la promesa no cambia para mantener compatibilidad
let resolvePromise: (value: boolean) => void
let rejectPromise: (reason?: any) => void

export function useConfirmationDialog() {
  const isConfirmationMet = computed(() => {
    // Si se requiere una selección, el botón de confirmar estará deshabilitado hasta que se elija una opción
    if (selectionConfig.value && !selectedValue.value) {
      return false
    }
    if (!confirmationText.value) {
      return true
    }
    return userInput.value === confirmationText.value
  })

  const reveal = (options: {
    title: string
    message: string
    confirmationText?: string
    selectionConfig?: {
      label: string
      items: SelectionOption[]
      displayField: string
      valueField: string
    }
  }): Promise<boolean> => {
    title.value = options.title
    message.value = options.message
    confirmationText.value = options.confirmationText || null
    selectionConfig.value = options.selectionConfig || null
    selectedValue.value = null
    userInput.value = ''
    isVisible.value = true

    return new Promise<boolean>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    })
  }

  const confirm = () => {
    if (!isConfirmationMet.value) return
    isVisible.value = false
    resolvePromise(true)
  }

  const cancel = () => {
    isVisible.value = false
    rejectPromise(false)
  }

  return {
    isVisible: readonly(isVisible),
    title: readonly(title),
    message: readonly(message),
    confirmationText: readonly(confirmationText),
    isConfirmationMet,
    userInput,
    selectionConfig: readonly(selectionConfig),
    selectedValue,
    reveal,
    confirm,
    cancel,
  }
}
