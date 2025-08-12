import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import documentService from '@/services/document.service'
import type {
  Document as DocumentType,
  UploadDocumentRequest,
  GetDocumentsRequest,
  UploadDocumentResponse,
  GetDocumentsResponse,
  DeleteDocumentResponse,
} from '@/services/document.service'
import { useToast } from '@/composables/useToast'

// Interfaces para el estado del store
export interface DocumentState {
  documents: DocumentType[]
  totalCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  selectedDocuments: string[]
  filters: {
    type?: DocumentType['type']
    search?: string
  }
}

// Tipos para las estadísticas de documentos
export interface DocumentStats {
  total: number
  byType: Record<DocumentType['type'], number>
  totalSize: number
  recentUploads: number
}

/**
 * Store para manejar el estado global de los documentos
 * Implementa todas las operaciones CRUD y manejo de estado
 */
export const useDocumentStore = defineStore('document', () => {
  const { triggerToast } = useToast()

  // Estado reactivo
  const documents = ref<DocumentType[]>([])
  const totalCount = ref<number>(0)
  const currentPage = ref<number>(1)
  const totalPages = ref<number>(1)
  const isLoading = ref<boolean>(false)
  const isUploading = ref<boolean>(false)
  const uploadProgress = ref<number>(0)
  const error = ref<string | null>(null)
  const selectedDocuments = ref<string[]>([])
  const filters = ref<DocumentState['filters']>({})

  // Computed properties
  const documentsByType = computed(() => {
    const grouped: Record<DocumentType['type'], DocumentType[]> = {
      contract: [],
      pliego: [],
      propuesta: [],
      constitution: [],
      other: [],
    }

    documents.value.forEach((doc) => {
      if (grouped[doc.type]) {
        grouped[doc.type].push(doc)
      }
    })

    return grouped
  })

  const documentStats = computed<DocumentStats>(() => {
    const stats: DocumentStats = {
      total: documents.value.length,
      byType: {
        contract: 0,
        pliego: 0,
        propuesta: 0,
        constitution: 0,
        other: 0,
      },
      totalSize: 0,
      recentUploads: 0,
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    documents.value.forEach((doc) => {
      stats.byType[doc.type]++
      stats.totalSize += doc.size

      if (new Date(doc.uploadedAt) > oneWeekAgo) {
        stats.recentUploads++
      }
    })

    return stats
  })

  const hasDocuments = computed(() => documents.value.length > 0)

  const filteredDocuments = computed(() => {
    let filtered = documents.value

    if (filters.value.type) {
      filtered = filtered.filter((doc) => doc.type === filters.value.type)
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm) ||
          doc.originalName.toLowerCase().includes(searchTerm) ||
          doc.description?.toLowerCase().includes(searchTerm),
      )
    }

    return filtered
  })

  const selectedDocumentsData = computed(() =>
    documents.value.filter((doc) => selectedDocuments.value.includes(doc._id)),
  )

  // Actions
  const clearError = () => {
    error.value = null
  }

  const setFilters = (newFilters: Partial<DocumentState['filters']>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const selectDocument = (documentId: string) => {
    if (!selectedDocuments.value.includes(documentId)) {
      selectedDocuments.value.push(documentId)
    }
  }

  const deselectDocument = (documentId: string) => {
    const index = selectedDocuments.value.indexOf(documentId)
    if (index > -1) {
      selectedDocuments.value.splice(index, 1)
    }
  }

  const toggleDocumentSelection = (documentId: string) => {
    if (selectedDocuments.value.includes(documentId)) {
      deselectDocument(documentId)
    } else {
      selectDocument(documentId)
    }
  }

  const selectAllDocuments = () => {
    selectedDocuments.value = documents.value.map((doc) => doc._id)
  }

  const clearSelection = () => {
    selectedDocuments.value = []
  }

  /**
   * Sube un nuevo documento
   */
  const uploadDocument = async (
    file: File,
    type: DocumentType['type'],
    description?: string,
  ): Promise<DocumentType | null> => {
    try {
      isUploading.value = true
      uploadProgress.value = 0
      error.value = null

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 200)

      const response: UploadDocumentResponse = await documentService.uploadDocument(
        file,
        type,
        description,
      )

      clearInterval(progressInterval)
      uploadProgress.value = 100

      if (response.success) {
        documents.value.unshift(response.document)
        totalCount.value++

        triggerToast(`${response.document.originalName} se ha subido correctamente`, 'success')

        return response.document
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || 'Error al subir el documento'
      triggerToast(error.value!, 'error')
      return null
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  /**
   * Obtiene todos los documentos del workspace
   */
  const fetchDocuments = async (params: GetDocumentsRequest = {}): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const response: GetDocumentsResponse = await documentService.getWorkspaceDocuments(params)

      if (response.success) {
        documents.value = response.documents
        totalCount.value = response.totalCount

        if (response.pagination) {
          currentPage.value = response.pagination.page
          totalPages.value = response.pagination.totalPages
        }
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los documentos'
      triggerToast(error.value!, 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Elimina un documento
   */
  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response: DeleteDocumentResponse = await documentService.deleteDocument(documentId)

      if (response.success) {
        const index = documents.value.findIndex((doc) => doc._id === documentId)
        if (index > -1) {
          const deletedDoc = documents.value[index]
          documents.value.splice(index, 1)
          totalCount.value--

          // Remover de selección si estaba seleccionado
          deselectDocument(documentId)

          triggerToast(`${deletedDoc.originalName} se ha eliminado correctamente`, 'success')
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar el documento'
      triggerToast(error.value!, 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Elimina múltiples documentos seleccionados
   */
  const deleteSelectedDocuments = async (): Promise<void> => {
    if (selectedDocuments.value.length === 0) return

    try {
      isLoading.value = true
      const deletePromises = selectedDocuments.value.map((id) => deleteDocument(id))
      await Promise.all(deletePromises)

      clearSelection()

      triggerToast(
        `Se eliminaron ${selectedDocuments.value.length} documentos correctamente`,
        'success',
      )
    } catch (err: any) {
      error.value = 'Error al eliminar los documentos seleccionados'
      triggerToast(error.value, 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza un documento
   */
  const updateDocument = async (
    documentId: string,
    updates: Partial<Pick<DocumentType, 'name' | 'description' | 'type'>>,
  ): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await documentService.updateDocument(documentId, updates)

      if (response.success) {
        const index = documents.value.findIndex((doc) => doc._id === documentId)
        if (index > -1) {
          documents.value[index] = response.document
        }

        triggerToast('Los cambios se han guardado correctamente', 'success')

        return true
      } else {
        throw new Error('Error al actualizar el documento')
      }
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el documento'
      triggerToast(error.value!, 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Descarga un documento
   */
  const downloadDocument = async (document: DocumentType): Promise<void> => {
    try {
      const blob = await documentService.downloadDocument(document._id)

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = document.originalName
      window.document.body.appendChild(link)
      link.click()

      // Limpiar
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      triggerToast(`Descargando ${document.originalName}`, 'success')
    } catch (err: any) {
      triggerToast('No se pudo descargar el documento', 'error')
    }
  }

  /**
   * Reinicia el estado del store
   */
  const resetState = () => {
    documents.value = []
    totalCount.value = 0
    currentPage.value = 1
    totalPages.value = 1
    isLoading.value = false
    isUploading.value = false
    uploadProgress.value = 0
    error.value = null
    selectedDocuments.value = []
    filters.value = {}
  }

  return {
    // Estado
    documents,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    selectedDocuments,
    filters,

    // Computed
    documentsByType,
    documentStats,
    hasDocuments,
    filteredDocuments,
    selectedDocumentsData,

    // Actions
    clearError,
    setFilters,
    clearFilters,
    selectDocument,
    deselectDocument,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    deleteSelectedDocuments,
    updateDocument,
    downloadDocument,
    resetState,
  }
})
