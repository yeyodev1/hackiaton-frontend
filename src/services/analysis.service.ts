import APIBase from './httpBase'
import type { IDocumentAnalysis } from '@/types/analysis.types'

export interface AnalyzeDocumentRequest {
  workspaceId: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  file: File
}

export interface AnalyzeDocumentByUrlRequest {
  workspaceId: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  documentUrl: string
  documentName: string
}

export interface CompareDocumentsRequest {
  workspaceId: string
  documentIds: string[]
}

export interface UploadAndCompareRequest {
  workspaceId: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  files: File[]
}

export interface DocumentInsightsRequest {
  analysisId: string
  focus?: 'legal' | 'technical' | 'economic' | 'risks'
}

export interface TechnicalAnalysisRequest {
  analysisId: string
  question?: string
}

export interface WorkspaceAnalysesRequest {
  workspaceId: string
  page?: number
  limit?: number
  documentType?: 'pliego' | 'propuesta' | 'contrato'
  status?: 'processing' | 'completed' | 'failed'
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface AnalysisResponse {
  success: boolean
  message: string
  analysis: IDocumentAnalysis
  analysisId: string
  workspace: {
    id: string
    name: string
    country: {
      name: string
      code: string
    }
    isFullyConfigured?: boolean
    status?: string
    settings?: any
    members?: any[]
    usage?: any
  }
}

export interface ComparisonResponse {
  success: boolean
  message: string
  comparison: {
    comparisonId: string
    documents: IDocumentAnalysis[]
    comparison: {
      legal: {
        bestCompliance: string
        riskComparison: Record<string, number>
        recommendations: string[]
      }
      technical: {
        mostComplete: string
        requirementsFulfillment: Record<string, number>
        technicalRisks: string[]
      }
      economic: {
        mostEconomical: string
        budgetComparison: Record<string, number>
        paymentTermsComparison: Record<string, string[]>
      }
    }
    ranking: {
      documentId: string
      documentName: string
      totalScore: number
      position: number
      strengths: string[]
      weaknesses: string[]
    }[]
    finalRecommendation: {
      recommendedDocument: string
      reasons: string[]
      criticalAlerts: string[]
    }
  }
}

export interface InsightsResponse {
  success: boolean
  message: string
  insights: {
    id: string
    documentName: string
    documentType: string
    focus: string
    analysis: string
    rucValidation?: {
      ruc: string
      companyName: string
      isValid: boolean
      canPerformWork: boolean
      businessType: string
    }
    createdAt: Date
    workspace: {
      id: string
      name: string
      country: string
    }
  }
}

export interface TechnicalAnalysisResponse {
  success: boolean
  message: string
  analysis: {
    id: string
    documentName: string
    documentType: string
    technicalAnalysis: string
    rucValidation?: {
      ruc: string
      companyName: string
      isValid: boolean
      canPerformWork: boolean
      businessType: string
    }
    sections: {
      legal: string[]
      technical: string[]
      economic: string[]
    }
    gaps: string[]
    inconsistencies: string[]
    risks: string[]
    createdAt: Date
    workspace: {
      id: string
      name: string
      country: string
    }
  }
}

class AnalysisService extends APIBase {
  private endpoint: string

  constructor() {
    super()
    this.endpoint = 'analysis'
  }

  /**
   * Analiza un documento individual
   */
  async analyzeDocument(request: AnalyzeDocumentRequest): Promise<AnalysisResponse> {
    const formData = new FormData()
    formData.append('workspaceId', request.workspaceId)
    formData.append('documentType', request.documentType)
    formData.append('document', request.file)

    const response = await this.post<AnalysisResponse>(`${this.endpoint}/document`, formData)

    return response.data
  }

  /**
   * Analiza un documento usando su URL
   */
  async analyzeDocumentByUrl(request: AnalyzeDocumentByUrlRequest): Promise<AnalysisResponse> {
    const response = await this.post<AnalysisResponse>(`${this.endpoint}/document`, {
      workspaceId: request.workspaceId,
      documentType: request.documentType,
      documentUrl: request.documentUrl,
      documentName: request.documentName,
    })

    return response.data
  }

  /**
   * Obtiene análisis de un workspace con paginación y filtros
   */
  async getWorkspaceAnalyses(
    request: WorkspaceAnalysesRequest,
  ): Promise<PaginatedResponse<IDocumentAnalysis>> {
    const params = new URLSearchParams()

    if (request.page) params.append('page', request.page.toString())
    if (request.limit) params.append('limit', request.limit.toString())
    if (request.documentType) params.append('documentType', request.documentType)
    if (request.status) params.append('status', request.status)

    const response = await this.get<{
      success: boolean
      message: string
      analyses: IDocumentAnalysis[]
      pagination: {
        currentPage: number
        totalPages: number
        totalCount: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
      workspace: {
        id: string
        name: string
        country: string
      }
    }>(`${this.endpoint}/workspace/${request.workspaceId}?${params.toString()}`)

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.analyses,
      pagination: response.data.pagination,
    }
  }

  /**
   * Obtiene un análisis específico por ID
   */
  async getAnalysisById(analysisId: string): Promise<{
    success: boolean
    message: string
    analysis: IDocumentAnalysis
  }> {
    const response = await this.get<{
      success: boolean
      message: string
      analysis: IDocumentAnalysis
    }>(`${this.endpoint}/${analysisId}`)

    return response.data
  }

  /**
   * Obtiene insights focalizados de un documento
   */
  async getDocumentInsights(request: DocumentInsightsRequest): Promise<InsightsResponse> {
    const params = new URLSearchParams()
    if (request.focus) params.append('focus', request.focus)

    const response = await this.get<InsightsResponse>(
      `${this.endpoint}/${request.analysisId}/insights?${params.toString()}`,
    )

    return response.data
  }

  /**
   * Obtiene análisis técnico especializado
   */
  async getTechnicalAnalysis(
    request: TechnicalAnalysisRequest,
  ): Promise<TechnicalAnalysisResponse> {
    const params = new URLSearchParams()
    if (request.question) params.append('question', request.question)

    const response = await this.get<TechnicalAnalysisResponse>(
      `${this.endpoint}/${request.analysisId}/technical?${params.toString()}`,
    )

    return response.data
  }

  /**
   * Compara múltiples documentos por IDs
   */
  async compareDocuments(request: CompareDocumentsRequest): Promise<ComparisonResponse> {
    const response = await this.post<ComparisonResponse>(`${this.endpoint}/compare`, {
      workspaceId: request.workspaceId,
      documentIds: request.documentIds,
    })

    return response.data
  }

  /**
   * Sube y compara múltiples documentos en una operación
   */
  async uploadAndCompare(request: UploadAndCompareRequest): Promise<ComparisonResponse> {
    const formData = new FormData()
    formData.append('workspaceId', request.workspaceId)
    formData.append('documentType', request.documentType)

    request.files.forEach((file) => {
      formData.append('documents', file)
    })

    const response = await this.post<ComparisonResponse>(
      `${this.endpoint}/upload-and-compare`,
      formData,
    )

    return response.data
  }
}

export const analysisService = new AnalysisService()
export default analysisService
