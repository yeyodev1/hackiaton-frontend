// Tipos para el análisis de documentos

export interface IRucValidation {
  ruc: string
  companyName: string
  isValid: boolean
  canPerformWork: boolean
  validationDate: Date
}

export interface IDocumentAnalysis {
  id: string
  documentId: string
  documentName: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  status: 'processing' | 'completed' | 'failed'
  aiAnalysis: string
  analysisDate: Date
  processingTime: number
  rucValidation?: IRucValidation
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface IDocumentInsights {
  id: string
  analysisId: string
  legalInsights: string
  technicalInsights: string
  economicInsights: string
  riskAssessment: string
  createdAt: Date
  updatedAt: Date
}

export interface ITechnicalAnalysis {
  id: string
  analysisId: string
  technicalRequirements: string
  complianceCheck: string
  recommendations: string
  createdAt: Date
  updatedAt: Date
}

export interface IDocumentComparison {
  id: string
  title: string
  documentIds: string[]
  comparisonResult: string
  status: 'processing' | 'completed' | 'failed'
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

// Request types
export interface IAnalyzeDocumentRequest {
  documentId: string
  analysisType: 'pliego' | 'propuesta' | 'contrato'
}

export interface ICompareDocumentsRequest {
  documentIds: string[]
  title?: string
}

export interface IUploadAndCompareRequest {
  files: File[]
  title?: string
}

// Response types
export interface IAnalysisResponse {
  success: boolean
  analysis?: IDocumentAnalysis
  message?: string
}

export interface IComparisonResponse {
  success: boolean
  comparison?: IDocumentComparison
  message?: string
}

export interface IInsightsResponse {
  success: boolean
  insights?: IDocumentInsights
  message?: string
}

export interface ITechnicalAnalysisResponse {
  success: boolean
  technicalAnalysis?: ITechnicalAnalysis
  message?: string
}

export interface IWorkspaceAnalysesResponse {
  success: boolean
  analyses: IDocumentAnalysis[]
  total: number
  page: number
  limit: number
  message?: string
}

// Filtros y paginación
export interface IAnalysisFilters {
  status?: 'processing' | 'completed' | 'failed'
  documentType?: 'pliego' | 'propuesta' | 'contrato'
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface IPaginationParams {
  page?: number
  limit?: number
}

export interface IGetWorkspaceAnalysesParams extends IPaginationParams {
  filters?: IAnalysisFilters
}