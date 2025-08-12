import APIBase from './httpBase'

// Interfaces para el servicio de agente
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysisId?: string
}

export interface ChatRequest {
  message: string
  conversationId?: string
}

export interface ChatWithDocumentRequest {
  message: string
  analysisId: string
  conversationId?: string
}

export interface ChatResponse {
  id: string
  message: string
  conversationId: string
  timestamp: string
  metadata?: {
    tokensUsed?: number
    processingTime?: number
    confidence?: number
  }
}

export interface DocumentInsight {
  id: string
  type: 'summary' | 'risk' | 'recommendation' | 'legal_point' | 'financial_impact'
  title: string
  content: string
  confidence: number
  relevance: number
  sources?: string[]
  createdAt: Date
}

export interface DocumentInsightsResponse {
  analysisId: string
  insights: DocumentInsight[]
  totalInsights: number
  lastUpdated: Date
}

export interface ComparisonInsightsRequest {
  analysisIds: string[]
  comparisonType: 'risk_assessment' | 'financial_comparison' | 'legal_differences' | 'general'
}

export interface ComparisonInsight {
  id: string
  type: string
  title: string
  content: string
  affectedAnalyses: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'risk' | 'opportunity' | 'difference' | 'similarity'
}

export interface ComparisonInsightsResponse {
  workspaceId: string
  insights: ComparisonInsight[]
  summary: string
  totalComparisons: number
  createdAt: Date
}

export interface LLMHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  uptime: number
  version: string
  capabilities: string[]
  lastCheck: Date
}

class AgentService extends APIBase {
  private endpoint = 'agent'

  constructor() {
    super()
  }

  /**
   * Chat general con el agente AI
   */
  async chatWithAgent(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.post<ChatResponse>(`${this.endpoint}/chat`, request)
      return response.data
    } catch (error) {
      console.error('Error en chat con agente:', error)
      throw new Error('Error al comunicarse con el agente AI')
    }
  }

  /**
   * Chat específico con el contexto de un documento analizado
   */
  async chatWithDocument(analysisId: string, request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.post<ChatResponse>(
        `${this.endpoint}/chat/document/${analysisId}`,
        request,
      )
      return response.data
    } catch (error) {
      console.error('Error en chat con documento:', error)
      throw new Error('Error al comunicarse con el agente sobre el documento')
    }
  }

  /**
   * Obtener insights específicos de un análisis de documento
   */
  async getDocumentInsights(analysisId: string): Promise<DocumentInsightsResponse> {
    try {
      const response = await this.get<DocumentInsightsResponse>(
        `${this.endpoint}/insights/document/${analysisId}`,
      )
      return response.data
    } catch (error) {
      console.error('Error obteniendo insights del documento:', error)
      throw new Error('Error al obtener insights del documento')
    }
  }

  /**
   * Obtener insights de comparación entre múltiples análisis
   */
  async getComparisonInsights(
    workspaceId: string,
    request: ComparisonInsightsRequest,
  ): Promise<ComparisonInsightsResponse> {
    try {
      const response = await this.post<ComparisonInsightsResponse>(
        `${this.endpoint}/insights/comparison/${workspaceId}`,
        request,
      )
      return response.data
    } catch (error) {
      console.error('Error obteniendo insights de comparación:', error)
      throw new Error('Error al obtener insights de comparación')
    }
  }

  /**
   * Verificar el estado de salud del servicio LLM
   */
  async getLLMHealth(): Promise<LLMHealthResponse> {
    try {
      const response = await this.get<LLMHealthResponse>(`${this.endpoint}/health`)
      return response.data
    } catch (error) {
      console.error('Error verificando salud del LLM:', error)
      throw new Error('Error al verificar el estado del servicio')
    }
  }

  /**
   * Generar un ID único para conversaciones
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Formatear mensaje para envío
   */
  formatMessage(content: string, conversationId?: string): ChatRequest {
    return {
      message: content.trim(),
      conversationId: conversationId || this.generateConversationId(),
    }
  }

  /**
   * Validar mensaje antes de envío
   */
  validateMessage(message: string): boolean {
    return message.trim().length > 0 && message.trim().length <= 4000
  }
}

const agentService = new AgentService()
export { agentService }
export default agentService