import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import workspaceService from '@/services/workspace.service'
import type {
  Workspace,
  WorkspaceSettings,
  Country,
  GetWorkspaceResponse,
  UpdateCountryResponse,
  UploadDocumentResponse,
  CompleteSetupResponse
} from '@/services/workspace.service'
import { useToast } from '@/composables/useToast'

/**
 * Store de workspace que maneja el estado del workspace del usuario,
 * configuración, documentos y todas las operaciones relacionadas
 */
export const useWorkspaceStore = defineStore('workspace', () => {
  // Estado reactivo
  const workspace = ref<Workspace | null>(null)
  const availableCountries = ref<Country[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const setupProgress = ref(0)
  const nextStep = ref<string | undefined>(undefined)

  // Composables
  const { triggerToast } = useToast()

  // Getters computados
  const hasWorkspace = computed(() => {
    return !!workspace.value
  })

  const isWorkspaceConfigured = computed(() => {
    return workspace.value?.isFullyConfigured ?? false
  })

  const workspaceName = computed(() => {
    return workspace.value?.name || ''
  })

  const workspaceStatus = computed(() => {
    return workspace.value?.status || 'active'
  })

  const selectedCountry = computed(() => {
    return workspace.value?.settings?.country || null
  })

  const workspaceDocuments = computed(() => {
    return workspace.value?.settings?.documents || []
  })

  const workspaceMembers = computed(() => {
    return workspace.value?.members || []
  })

  const workspaceUsage = computed(() => {
    return workspace.value?.usage || { documentCount: 0, analysisCount: 0 }
  })

  const isOwner = computed(() => {
    // Aquí podrías comparar con el ID del usuario actual desde el auth store
    return workspace.value?.members?.some(member => member.role === 'owner') ?? false
  })

  const canManageWorkspace = computed(() => {
    const userRole = workspace.value?.members?.find(member => member.role === 'owner' || member.role === 'admin')?.role
    return userRole === 'owner' || userRole === 'admin'
  })

  const hasCompanyDocument = computed(() => {
    return !!workspace.value?.settings?.legalDocuments?.companyDocument
  })

  const setupProgressPercentage = computed(() => {
    if (!workspace.value) return 0
    
    let progress = 0
    const steps = 4 // Total de pasos de configuración
    
    // Paso 1: País seleccionado
    if (workspace.value.settings?.country?.code) progress++
    
    // Paso 2: Documento de empresa subido
    if (workspace.value.settings?.legalDocuments?.companyDocument) progress++
    
    // Paso 3: Configuración básica completada
    if (workspace.value.settings?.analysisConfig) progress++
    
    // Paso 4: Setup completado
    if (workspace.value.isFullyConfigured) progress++
    
    return Math.round((progress / steps) * 100)
  })

  // Acciones

  /**
   * Inicializa el workspace del usuario
   */
  const initializeWorkspace = async (): Promise<void> => {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      await fetchUserWorkspace()
    } catch (error) {
      console.error('Error inicializando workspace:', error)
      triggerToast('Error al cargar el workspace', 'error')
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Obtiene el workspace del usuario
   */
  const fetchUserWorkspace = async (): Promise<void> => {
    try {
      isLoading.value = true

      const response: GetWorkspaceResponse = await workspaceService.getUserWorkspace()

      if (response.success) {
        workspace.value = response.workspace
        availableCountries.value = response.availableCountries
      } else {
        throw new Error(response.message || 'Error al obtener el workspace')
      }
    } catch (error: any) {
      console.error('Error obteniendo workspace:', error)
      triggerToast(error.message || 'Error al cargar el workspace', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza el país del workspace
   */
  const updateWorkspaceCountry = async (countryCode: string): Promise<void> => {
    try {
      isLoading.value = true

      const response: UpdateCountryResponse = await workspaceService.updateWorkspaceCountry(countryCode)

      if (response.success) {
        workspace.value = response.workspace
        triggerToast('País actualizado correctamente', 'success')
      } else {
        throw new Error(response.message || 'Error al actualizar el país')
      }
    } catch (error: any) {
      console.error('Error actualizando país:', error)
      triggerToast(error.message || 'Error al actualizar el país', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sube un documento de la empresa
   */
  const uploadCompanyDocument = async (file: File): Promise<void> => {
    try {
      isLoading.value = true

      const response: UploadDocumentResponse = await workspaceService.uploadCompanyDocument(file)

      if (response.success) {
        workspace.value = response.workspace
        triggerToast('Documento subido correctamente', 'success')
      } else {
        throw new Error(response.message || 'Error al subir el documento')
      }
    } catch (error: any) {
      console.error('Error subiendo documento:', error)
      triggerToast(error.message || 'Error al subir el documento', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Completa la configuración del workspace
   */
  const completeWorkspaceSetup = async (): Promise<void> => {
    try {
      isLoading.value = true

      const response: CompleteSetupResponse = await workspaceService.completeWorkspaceSetup()

      if (response.success) {
        workspace.value = response.workspace
        triggerToast('Configuración completada exitosamente', 'success')
      } else {
        throw new Error(response.message || 'Error al completar la configuración')
      }
    } catch (error: any) {
      console.error('Error completando setup:', error)
      triggerToast(error.message || 'Error al completar la configuración', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza la configuración del workspace
   */
  const updateWorkspaceSettings = async (settings: Partial<WorkspaceSettings>): Promise<void> => {
    try {
      isLoading.value = true

      const response: UpdateCountryResponse = await workspaceService.updateWorkspaceSettings(settings)

      if (response.success) {
        workspace.value = response.workspace
        triggerToast('Configuración actualizada correctamente', 'success')
      } else {
        throw new Error(response.message || 'Error al actualizar la configuración')
      }
    } catch (error: any) {
      console.error('Error actualizando configuración:', error)
      triggerToast(error.message || 'Error al actualizar la configuración', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza los datos básicos del workspace
   */
  const updateWorkspaceData = async (data: Partial<Pick<Workspace, 'name' | 'status'>>): Promise<void> => {
    try {
      isLoading.value = true

      const response: UpdateCountryResponse = await workspaceService.updateWorkspaceData(data)

      if (response.success) {
        workspace.value = response.workspace
        triggerToast('Workspace actualizado correctamente', 'success')
      } else {
        throw new Error(response.message || 'Error al actualizar el workspace')
      }
    } catch (error: any) {
      console.error('Error actualizando workspace:', error)
      triggerToast(error.message || 'Error al actualizar el workspace', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene el progreso de configuración
   */
  const fetchSetupProgress = async (): Promise<void> => {
    try {
      const response = await workspaceService.getSetupProgress()
      setupProgress.value = response.progress
      nextStep.value = response.nextStep
    } catch (error: any) {
      console.error('Error obteniendo progreso:', error)
    }
  }

  /**
   * Valida la configuración del workspace
   */
  const validateWorkspaceSetup = async (): Promise<{
    isValid: boolean
    missingSteps: string[]
    canProceed: boolean
  }> => {
    try {
      const response = await workspaceService.validateWorkspaceSetup()
      return response
    } catch (error: any) {
      console.error('Error validando configuración:', error)
      return {
        isValid: false,
        missingSteps: ['Error de validación'],
        canProceed: false
      }
    }
  }

  /**
   * Obtiene los países disponibles
   */
  const fetchAvailableCountries = async (): Promise<void> => {
    try {
      const countries = await workspaceService.getAvailableCountries()
      availableCountries.value = countries
    } catch (error: any) {
      console.error('Error obteniendo países:', error)
      triggerToast('Error al cargar países disponibles', 'error')
    }
  }

  /**
   * Resetea el estado del store
   */
  const resetStore = (): void => {
    workspace.value = null
    availableCountries.value = []
    isLoading.value = false
    isInitialized.value = false
    setupProgress.value = 0
    nextStep.value = undefined
  }

  /**
   * Obtiene información del workspace
   */
  const getWorkspaceInfo = () => {
    return {
      hasWorkspace: hasWorkspace.value,
      isConfigured: isWorkspaceConfigured.value,
      name: workspaceName.value,
      status: workspaceStatus.value,
      progress: setupProgressPercentage.value,
      memberCount: workspaceMembers.value.length,
      documentCount: workspaceUsage.value.documentCount,
      analysisCount: workspaceUsage.value.analysisCount
    }
  }

  return {
    // Estado
    workspace,
    availableCountries,
    isLoading,
    isInitialized,
    setupProgress,
    nextStep,

    // Getters
    hasWorkspace,
    isWorkspaceConfigured,
    workspaceName,
    workspaceStatus,
    selectedCountry,
    workspaceDocuments,
    workspaceMembers,
    workspaceUsage,
    isOwner,
    canManageWorkspace,
    hasCompanyDocument,
    setupProgressPercentage,

    // Acciones
    initializeWorkspace,
    fetchUserWorkspace,
    updateWorkspaceCountry,
    uploadCompanyDocument,
    completeWorkspaceSetup,
    updateWorkspaceSettings,
    updateWorkspaceData,
    fetchSetupProgress,
    validateWorkspaceSetup,
    fetchAvailableCountries,
    resetStore,
    getWorkspaceInfo
  }
})