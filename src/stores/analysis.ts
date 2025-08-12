import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IDocumentAnalysis } from '@/types/analysis.types'
import analysisService, {
  type AnalyzeDocumentRequest,
  type AnalyzeDocumentByUrlRequest,
  type CompareDocumentsRequest,
  type UploadAndCompareRequest,
  type DocumentInsightsRequest,
  type TechnicalAnalysisRequest,
  type WorkspaceAnalysesRequest,
  type PaginatedResponse,
  type AnalysisResponse,
  type ComparisonResponse,
  type InsightsResponse,
  type TechnicalAnalysisResponse
} from '@/services/analysis.service'
import { useWorkspaceStore } from '@/stores/workspace'

export interface AnalysisState {
  analyses: IDocumentAnalysis[]
  currentAnalysis: IDocumentAnalysis | null
  isLoading: boolean
  isAnalyzing: boolean
  isComparing: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  lastComparison: ComparisonResponse['comparison'] | null
  insights: InsightsResponse['insights'] | null
  technicalAnalysis: TechnicalAnalysisResponse['analysis'] | null
}

export const useAnalysisStore = defineStore('analysis', () => {
  // Estado reactivo
  const analyses = ref<IDocumentAnalysis[]>([])
  const currentAnalysis = ref<IDocumentAnalysis | null>(null)
  const isLoading = ref(false)
  const isAnalyzing = ref(false)
  const isComparing = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<AnalysisState['pagination']>(null)
  const lastComparison = ref<ComparisonResponse['comparison'] | null>(null)
  const insights = ref<InsightsResponse['insights'] | null>(null)
  const technicalAnalysis = ref<TechnicalAnalysisResponse['analysis'] | null>(null)

  // Computed properties
  const hasAnalyses = computed(() => analyses.value.length > 0)
  const completedAnalyses = computed(() => 
    analyses.value.filter(analysis => analysis.status === 'completed')
  )
  const processingAnalyses = computed(() => 
    analyses.value.filter(analysis => analysis.status === 'processing')
  )
  const failedAnalyses = computed(() => 
    analyses.value.filter(analysis => analysis.status === 'failed')
  )

  // Actions
  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setAnalyzing = (analyzing: boolean) => {
    isAnalyzing.value = analyzing
  }

  const setComparing = (comparing: boolean) => {
    isComparing.value = comparing
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  /**
   * Analiza un documento individual
   */
  const analyzeDocument = async (request: AnalyzeDocumentRequest): Promise<IDocumentAnalysis | null> => {
    try {
      setAnalyzing(true)
      clearError()

      const response = await analysisService.analyzeDocument(request)
      
      if (response.success) {
        // Agregar el nuevo análisis a la lista
        analyses.value.unshift(response.analysis)
        currentAnalysis.value = response.analysis
        return response.analysis
      } else {
        setError(response.message || 'Error al analizar el documento')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al analizar documento'
      setError(errorMessage)
      return null
    } finally {
      setAnalyzing(false)
    }
  }

  /**
   * Analiza un documento usando su URL
   */
  const analyzeDocumentByUrl = async (request: AnalyzeDocumentByUrlRequest): Promise<IDocumentAnalysis | null> => {
    try {
      setAnalyzing(true)
      clearError()

      const response = await analysisService.analyzeDocumentByUrl(request)
      
      if (response.success) {
        // Agregar el nuevo análisis a la lista
        analyses.value.unshift(response.analysis)
        currentAnalysis.value = response.analysis
        
        // Actualizar el workspace si viene en la respuesta
        if (response.workspace) {
          const workspaceStore = useWorkspaceStore()
          console.log('🔍 Workspace antes de actualizar:', workspaceStore.workspace)
          console.log('🔍 Workspace de respuesta:', response.workspace)
          console.log('🔍 isWorkspaceConfigured antes:', workspaceStore.isWorkspaceConfigured)
          
          if (workspaceStore.workspace) {
            // Actualizar solo las propiedades relevantes del workspace existente
            workspaceStore.workspace.isFullyConfigured = response.workspace.isFullyConfigured ?? true
            if (response.workspace.status) {
              workspaceStore.workspace.status = response.workspace.status as 'active' | 'paused' | 'archived'
            }
            if (response.workspace.country) {
              workspaceStore.workspace.settings.country = response.workspace.country
            }
            
            console.log('🔍 Workspace después de actualizar:', workspaceStore.workspace)
            console.log('🔍 isWorkspaceConfigured después:', workspaceStore.isWorkspaceConfigured)
          }
        }
        
        return response.analysis
      } else {
        setError(response.message || 'Error al analizar el documento por URL')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al analizar documento por URL'
      setError(errorMessage)
      return null
    } finally {
      setAnalyzing(false)
    }
  }

  /**
   * Obtiene análisis de un workspace con paginación
   */
  const fetchWorkspaceAnalyses = async (request: WorkspaceAnalysesRequest): Promise<boolean> => {
    try {
      setLoading(true)
      clearError()

      const response = await analysisService.getWorkspaceAnalyses(request)
      
      if (response.success) {
        // Si es la primera página, reemplazar; si no, agregar
        if (request.page === 1 || !request.page) {
          analyses.value = response.data
        } else {
          analyses.value.push(...response.data)
        }
        
        pagination.value = response.pagination
        return true
      } else {
        setError(response.message || 'Error al obtener análisis')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener análisis'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene un análisis específico por ID
   */
  const fetchAnalysisById = async (analysisId: string): Promise<IDocumentAnalysis | null> => {
    try {
      setLoading(true)
      clearError()

      const response = await analysisService.getAnalysisById(analysisId)
      
      if (response.success) {
        currentAnalysis.value = response.analysis
        
        // Actualizar en la lista si existe
        const index = analyses.value.findIndex(a => a.id === analysisId)
        if (index !== -1) {
          analyses.value[index] = response.analysis
        }
        
        return response.analysis
      } else {
        setError(response.message || 'Error al obtener análisis')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener análisis'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene insights focalizados de un documento
   */
  const fetchDocumentInsights = async (request: DocumentInsightsRequest): Promise<boolean> => {
    try {
      setLoading(true)
      clearError()

      const response = await analysisService.getDocumentInsights(request)
      
      if (response.success) {
        insights.value = response.insights
        return true
      } else {
        setError(response.message || 'Error al obtener insights')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener insights'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene análisis técnico especializado
   */
  const fetchTechnicalAnalysis = async (request: TechnicalAnalysisRequest): Promise<boolean> => {
    try {
      setLoading(true)
      clearError()

      const response = await analysisService.getTechnicalAnalysis(request)
      
      if (response.success) {
        technicalAnalysis.value = response.analysis
        return true
      } else {
        setError(response.message || 'Error al obtener análisis técnico')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener análisis técnico'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Compara múltiples documentos
   */
  const compareDocuments = async (request: CompareDocumentsRequest): Promise<boolean> => {
    try {
      setComparing(true)
      clearError()

      const response = await analysisService.compareDocuments(request)
      
      if (response.success) {
        lastComparison.value = response.comparison
        return true
      } else {
        setError(response.message || 'Error al comparar documentos')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al comparar documentos'
      setError(errorMessage)
      return false
    } finally {
      setComparing(false)
    }
  }

  /**
   * Sube y compara múltiples documentos
   */
  const uploadAndCompare = async (request: UploadAndCompareRequest): Promise<boolean> => {
    try {
      setComparing(true)
      clearError()

      const response = await analysisService.uploadAndCompare(request)
      
      if (response.success) {
        lastComparison.value = response.comparison
        // Agregar los documentos analizados a la lista
        if (response.comparison.documents) {
          analyses.value.unshift(...response.comparison.documents)
        }
        return true
      } else {
        setError(response.message || 'Error al subir y comparar documentos')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al subir y comparar documentos'
      setError(errorMessage)
      return false
    } finally {
      setComparing(false)
    }
  }

  /**
   * Limpia el estado actual
   */
  const clearCurrentState = () => {
    currentAnalysis.value = null
    insights.value = null
    technicalAnalysis.value = null
    lastComparison.value = null
    clearError()
  }

  /**
   * Limpia todos los análisis
   */
  const clearAnalyses = () => {
    analyses.value = []
    pagination.value = null
    clearCurrentState()
  }

  /**
   * Refresca un análisis específico
   */
  const refreshAnalysis = async (analysisId: string): Promise<boolean> => {
    return await fetchAnalysisById(analysisId) !== null
  }

  /**
   * Elimina un análisis de la lista local
   */
  const removeAnalysis = (analysisId: string) => {
    const index = analyses.value.findIndex(a => a.id === analysisId)
    if (index !== -1) {
      analyses.value.splice(index, 1)
    }
    
    if (currentAnalysis.value?.id === analysisId) {
      currentAnalysis.value = null
    }
  }

  /**
   * Actualiza el estado de un análisis
   */
  const updateAnalysisStatus = (analysisId: string, status: IDocumentAnalysis['status']) => {
    const analysis = analyses.value.find(a => a.id === analysisId)
    if (analysis) {
      analysis.status = status
    }
    
    if (currentAnalysis.value?.id === analysisId) {
      currentAnalysis.value.status = status
    }
  }

  return {
    // Estado
    analyses,
    currentAnalysis,
    isLoading,
    isAnalyzing,
    isComparing,
    error,
    pagination,
    lastComparison,
    insights,
    technicalAnalysis,
    
    // Computed
    hasAnalyses,
    completedAnalyses,
    processingAnalyses,
    failedAnalyses,
    
    // Actions
    clearError,
    setLoading,
    setAnalyzing,
    setComparing,
    setError,
    analyzeDocument,
    analyzeDocumentByUrl,
    fetchWorkspaceAnalyses,
    fetchAnalysisById,
    fetchDocumentInsights,
    fetchTechnicalAnalysis,
    compareDocuments,
    uploadAndCompare,
    clearCurrentState,
    clearAnalyses,
    refreshAnalysis,
    removeAnalysis,
    updateAnalysisStatus
  }
})